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

use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{
    configuration_operation,
    configuration_operation::WhereParam as ConfigurationOperationWhereParam, user_operation,
    user_operation::WhereParam as UserOperationWhereParam, ConfigurationOperationStatus,
    UserOperationStatus,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use super::types::Operation;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first operation to return.
    pub offset: Option<i64>,
    /// The maximum number of operations to return.
    pub limit: Option<i64>,
    /// The address to filter by.
    pub address: Option<String>,
    /// The chain id to filter by.
    pub chain_id: Option<i64>,
    /// The status to filter by.
    #[param(inline)]
    pub status: Option<ListQueryStatus>,
    /// The direction to order by.
    #[param(inline)]
    pub order: Option<ListQueryOrder>,
    /// The flag to indicate if the operation is a testnet operation.
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
    // Configuration operation status
    Confirmed,
    Rejected,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of operations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct OperationListCount {
    /// The count of the list of operations.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

#[utoipa::path(
    get,
    path = "/operation/list",
    params(
        ListQuery
    ),
    responses(
        (status = 200, description = "Operations returned successfully", body = [Operation]),
        (status = 500, description = "Operation bad request", body = OperationError),
    )
)]
#[autometrics]
pub(crate) async fn v1_operation_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Operation>> {
    let Query(query) = list_query;

    info!("List operations: {:?}", query);
    let limit = query.limit.unwrap_or(10) as usize;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the queries.
    let user_op_params = construct_user_operation_list_query_params(&query);
    let config_op_params = construct_configuration_operation_list_query_params(&query);

    // Parse the order from the pagination query.
    let order = match query.order {
        Some(ListQueryOrder::Asc) => Direction::Asc,
        Some(ListQueryOrder::Desc) => Direction::Desc,
        None => Direction::Asc,
    };

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operations from the database.
    let user_operations = state
        .client
        .user_operation()
        .find_many(user_op_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .order_by(user_operation::created_at::order(order.clone()))
        .exec()
        .await?;

    // Get the configuration operations from the database.
    let configuration_operations = state
        .client
        .configuration_operation()
        .find_many(config_op_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .order_by(configuration_operation::created_at::order(order))
        .exec()
        .await?;

    // Combine and sort results
    let mut operations: Vec<Operation> = user_operations
        .into_iter()
        .map(|uop| Operation::UserOperation(uop.into()))
        .chain(
            configuration_operations
                .into_iter()
                .map(|cop| Operation::ConfigurationOperation(cop.into())),
        )
        .collect();

    operations.sort_by(|a, b| {
        let a_time = match a {
            Operation::UserOperation(uo) => uo.clone().created_at,
            Operation::ConfigurationOperation(co) => co.clone().created_at,
        };
        let b_time = match b {
            Operation::UserOperation(uo) => uo.clone().created_at,
            Operation::ConfigurationOperation(co) => co.clone().created_at,
        };
        b_time.cmp(&a_time)
    });

    operations.truncate(limit);

    Ok(Json::from(operations))
}

#[utoipa::path(
    get,
    path = "/operation/list/count",
    params(
        ListQuery
    ),
    responses(
        (status = 200, description = "Operation count returned successfully", body = OperationListCount),
        (status = 500, description = "Operation count bad request", body = OperationError),
    )
)]
#[autometrics]
pub(crate) async fn v1_operation_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<OperationListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    let Query(query) = list_query;

    info!("Count operations: {:?}", query);

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the queries.
    let user_op_params = construct_user_operation_list_query_params(&query);
    let config_op_params = construct_configuration_operation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user operations count from the database.
    let user_op_count = state.client.user_operation().count(user_op_params).exec().await?;

    // Get the configuration operations count from the database.
    let config_op_count =
        state.client.configuration_operation().count(config_op_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(OperationListCount { count: user_op_count + config_op_count }))
}
// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for user operation.
fn construct_user_operation_list_query_params(query: &ListQuery) -> Vec<UserOperationWhereParam> {
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
            _ => {} // Other statuses don't apply to user operations
        }
    }

    if let Some(chain_id) = &query.chain_id {
        query_exp.push(user_operation::chain_id::equals(*chain_id));
    }

    match &query.is_testnet {
        Some(false) | None => query_exp.push(user_operation::is_testnet::equals(false)),
        _ => (),
    }

    query_exp
}

/// Constructs a query for configuration operation.
fn construct_configuration_operation_list_query_params(
    query: &ListQuery,
) -> Vec<ConfigurationOperationWhereParam> {
    let mut query_exp = match &query.address {
        Some(address) => vec![configuration_operation::address::equals(address.to_string())],
        None => vec![],
    };

    if let Some(status) = &query.status {
        match status {
            ListQueryStatus::Proposed => query_exp.push(configuration_operation::status::equals(
                ConfigurationOperationStatus::Proposed,
            )),
            ListQueryStatus::Pending => query_exp.push(configuration_operation::status::equals(
                ConfigurationOperationStatus::Pending,
            )),
            ListQueryStatus::Confirmed => query_exp.push(configuration_operation::status::equals(
                ConfigurationOperationStatus::Confirmed,
            )),
            ListQueryStatus::Rejected => query_exp.push(configuration_operation::status::equals(
                ConfigurationOperationStatus::Rejected,
            )),
            ListQueryStatus::Invalid => query_exp.push(configuration_operation::status::equals(
                ConfigurationOperationStatus::Invalid,
            )),
            _ => {} // Other statuses don't apply to configuration operations
        }
    }

    query_exp
}
