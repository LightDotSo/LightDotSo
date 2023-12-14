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
use lightdotso_prisma::{user_operation, UserOperationStatus};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::Deserialize;
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

#[derive(Debug, Deserialize, ToSchema)]
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
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<UserOperation>> {
    // Get the pagination query.
    let Query(pagination) = pagination;
    info!(?pagination);

    // If the address is provided, add it to the query.
    let mut query = match pagination.address {
        Some(owner) => vec![user_operation::sender::equals(owner)],
        None => vec![],
    };

    // If the status is provided, add it to the query.
    if let Some(status) = pagination.status {
        query.push(user_operation::status::equals(status.into()))
    }

    // If the is_testnet is provided, add it to the query.
    if let Some(is_testnet) = pagination.is_testnet {
        query.push(user_operation::is_testnet::equals(is_testnet))
    }

    // Parse the order from the pagination query.
    let order = match pagination.order {
        Some(ListQueryOrder::Asc) => Direction::Asc,
        Some(ListQueryOrder::Desc) => Direction::Desc,
        None => Direction::Asc,
    };

    // Get the user operations from the database.
    let user_operations = client
        .client
        .user_operation()
        .find_many(query)
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
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
