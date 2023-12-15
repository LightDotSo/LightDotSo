// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

use crate::{result::AppJsonResult, routes::user_operation::types::UserOperation, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{
    user_operation::{self, WhereParam},
    UserOperationStatus,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first user operation to return.
    pub offset: Option<i64>,
    /// The maximum number of user operations to return.
    pub limit: Option<i64>,
    /// The sender address to filter by.
    pub address: Option<String>,
    /// The status to filter by.
    #[param(inline)]
    pub status: Option<ListQueryStatus>,
    /// The direction to order by.
    /// Default is `asc`.
    #[param(inline)]
    pub order: Option<ListQueryOrder>,
    /// The flag to indicate if the operation is a testnet user operation.
    pub is_testnet: Option<bool>,
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum ListQueryOrder {
    Asc,
    Desc,
}

#[derive(Clone, Debug, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum ListQueryStatus {
    Proposed,
    Pending,
    Executed,
    Reverted,
}

/// Implement From<owner::Data> for Owner.
impl From<ListQueryStatus> for UserOperationStatus {
    fn from(status: ListQueryStatus) -> Self {
        match status {
            ListQueryStatus::Proposed => UserOperationStatus::Proposed,
            ListQueryStatus::Pending => UserOperationStatus::Pending,
            ListQueryStatus::Executed => UserOperationStatus::Executed,
            ListQueryStatus::Reverted => UserOperationStatus::Reverted,
        }
    }
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of user operations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct UserOperationListCount {
    /// The count of the list of user operations..
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of user operations.
#[utoipa::path(
        get,
        path = "/user_operation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "User Operations returned successfully", body = [UserOperation]),
            (status = 500, description = "User Operation bad request", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_list_handler(
    query: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<UserOperation>> {
    // Get the query.
    let Query(list_query) = query;
    info!(?list_query);

    // Construct the query.
    let query = construct_user_operation_list_query(&list_query);

    // Parse the order from the pagination query.
    let order = match list_query.order {
        Some(ListQueryOrder::Asc) => Direction::Asc,
        Some(ListQueryOrder::Desc) => Direction::Desc,
        None => Direction::Asc,
    };

    // Get the user operations from the database.
    let user_operations = client
        .client
        .user_operation()
        .find_many(query)
        .skip(list_query.offset.unwrap_or(0))
        .take(list_query.limit.unwrap_or(10))
        .order_by(user_operation::nonce::order(order))
        .with(user_operation::signatures::fetch(vec![]))
        .with(user_operation::transaction::fetch())
        .exec()
        .await?;

    // Change the user operations to the format that the API expects.
    let user_operations: Vec<UserOperation> =
        user_operations.into_iter().map(UserOperation::from).collect();

    Ok(Json::from(user_operations))
}

/// Returns a count of user operations.
#[utoipa::path(
        get,
        path = "/user_operation/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "User Operation count returned successfully", body = UserOperationListCount),
            (status = 500, description = "User Operation count bad request", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_list_count_handler(
    query: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<UserOperationListCount> {
    // Get the query.
    let Query(list_query) = query;
    info!(?list_query);

    // Construct the query.
    let query = construct_user_operation_list_query(&list_query);

    // Get the user operations from the database.
    let count = client.client.user_operation().count(query).exec().await?;

    Ok(Json::from(UserOperationListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for user operation.
fn construct_user_operation_list_query(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(address) => vec![user_operation::sender::equals(address.to_string())],
        None => vec![],
    };

    if let Some(status) = &query.status {
        query_exp.push(user_operation::status::equals(status.clone().into()));
    }

    match &query.is_testnet {
        Some(false) | None => query_exp.push(user_operation::is_testnet::equals(false)),
        _ => (),
    }

    query_exp
}
