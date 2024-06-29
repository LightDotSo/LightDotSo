// Copyright 2023-2024 Light
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

use super::types::ConfigurationOperation;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{
    configuration_operation::{self, WhereParam},
    ConfigurationOperationStatus,
};
use prisma_client_rust::or;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first interpretation action to return.
    pub offset: Option<i64>,
    /// The maximum number of interpretation actions to return.
    pub limit: Option<i64>,
    /// The status to filter by.
    pub status: Option<String>,
    /// The address to filter by.
    pub address: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of interpretation actions.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct ConfigurationOperationListCount {
    /// The count of the list of interpretation actions.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of interpretation actions
#[utoipa::path(
        get,
        path = "/configuration_operation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Configuration Operations returned successfully", body = [ConfigurationOperation]),
            (status = 500, description = "Configuration Operation bad request", body = ConfigurationOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<ConfigurationOperation>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_configuration_operation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretation actions from the database.
    let configuration_operations = state
        .client
        .configuration_operation()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the interpretation actions to the format that the API expects.
    let configuration_operations: Vec<ConfigurationOperation> =
        configuration_operations.into_iter().map(ConfigurationOperation::from).collect();

    Ok(Json::from(configuration_operations))
}

/// Returns a count of list of interpretation actions
#[utoipa::path(
        get,
        path = "/configuration_operation/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Configuration Operations returned successfully", body = ConfigurationOperationListCount),
            (status = 500, description = "Configuration Operations bad request", body = ConfigurationOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<ConfigurationOperationListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_configuration_operation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretation actions from the database.
    let count = state.client.configuration_operation().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(ConfigurationOperationListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for interpretation actions.
fn construct_configuration_operation_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(address) => vec![or![
            configuration_operation::address::equals("".to_string()),
            configuration_operation::address::equals(address.to_string())
        ]],
        None => vec![],
    };

    if let Some(_status) = &query.status {
        query_exp
            .push(configuration_operation::status::equals(ConfigurationOperationStatus::Confirmed));
    }

    query_exp
}
