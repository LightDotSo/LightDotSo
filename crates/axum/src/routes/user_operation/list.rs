// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use super::{error::UserOperationError, types::UserOperation};
use crate::result::AppJsonResult;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{
    asset_change, interpretation, interpretation_action,
    user_operation::{self, WhereParam},
    UserOperationStatus,
};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first user operation to return.
    pub offset: Option<i64>,
    /// The maximum number of user operations to return.
    pub limit: Option<i64>,
    /// The sender address to filter by.
    pub address: Option<String>,
    /// The chain id to filter by.
    pub chain_id: Option<i64>,
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
    // Custom status
    Queued,
    History,
    // User operation status
    Proposed,
    Pending,
    Reverted,
    Executed,
    Invalid,
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

/// Returns a list of user operations
///
/// Returns a list of user operations with optional filtering.
#[utoipa::path(
        get,
        path = "/user_operation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "User operations returned successfully", body = [UserOperation]),
            (status = 500, description = "User operation bad request", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Vec<UserOperation>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the query.
    let query_params = construct_user_operation_list_query_params(&query);

    // Parse the order from the pagination query.
    let order = match query.order {
        Some(ListQueryOrder::Asc) => Direction::Asc,
        Some(ListQueryOrder::Desc) => Direction::Desc,
        None => Direction::Asc,
    };

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretation action params.
    let mut interpretation_action_params = vec![];
    if let Some(addr) = &query.address {
        interpretation_action_params
            .push(or![interpretation_action::address::equals(addr.clone()),]);
    }

    // Get the user operations from the database.
    let user_operations = state
        .client
        .user_operation()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .order_by(user_operation::created_at::order(order))
        .with(user_operation::paymaster::fetch())
        .with(user_operation::paymaster_operation::fetch())
        .with(user_operation::transaction::fetch())
        .with(user_operation::signatures::fetch(vec![]))
        .with(
            user_operation::interpretation::fetch()
                .with(interpretation::actions::fetch(interpretation_action_params))
                .with(
                    interpretation::asset_changes::fetch(vec![])
                        .with(asset_change::interpretation_action::fetch())
                        .with(asset_change::token::fetch()),
                ),
        )
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the user operations to the format that the API expects.
    let user_operations: Vec<UserOperation> =
        user_operations.into_iter().map(UserOperation::from).collect();

    Ok(Json::from(user_operations))
}

/// Returns a count of user operations
///
/// Returns a count of user operations with optional filtering.
#[utoipa::path(
        get,
        path = "/user_operation/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "User operation count returned successfully", body = UserOperationListCount),
            (status = 500, description = "User operation count bad request", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<UserOperationListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the query.
    let query_params = construct_user_operation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operations from the database.
    let count = state.client.user_operation().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(UserOperationListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for user operation.
fn construct_user_operation_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(address) => vec![user_operation::sender::equals(address.to_string())],
        None => vec![],
    };

    if let Some(status) = &query.status {
        match status {
            ListQueryStatus::Proposed => {
                query_exp.push(user_operation::status::equals(UserOperationStatus::Proposed))
            }
            ListQueryStatus::Queued => query_exp.push(or![
                user_operation::status::equals(UserOperationStatus::Pending),
                user_operation::status::equals(UserOperationStatus::Proposed)
            ]),
            ListQueryStatus::History => query_exp.push(or![
                user_operation::status::equals(UserOperationStatus::Executed),
                user_operation::status::equals(UserOperationStatus::Reverted),
            ]),
            ListQueryStatus::Pending => {
                query_exp.push(user_operation::status::equals(UserOperationStatus::Pending))
            }
            ListQueryStatus::Executed => {
                query_exp.push(user_operation::status::equals(UserOperationStatus::Executed))
            }
            ListQueryStatus::Reverted => {
                query_exp.push(user_operation::status::equals(UserOperationStatus::Reverted))
            }
            ListQueryStatus::Invalid => {
                query_exp.push(user_operation::status::equals(UserOperationStatus::Invalid))
            }
        }
    }

    if let Some(chain_id) = &query.chain_id {
        query_exp.push(user_operation::chain_id::equals(*chain_id));

        return query_exp;
    }

    match &query.is_testnet {
        Some(false) | None => query_exp.push(user_operation::is_testnet::equals(false)),
        _ => (),
    }

    query_exp
}
