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

use super::types::ConfigurationOperation;
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::configuration_operation::error::ConfigurationOperationError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::configuration_operation;
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a configuration_operation
///
/// Gets a configuration operation by id.
#[utoipa::path(
        get,
        path = "/configuration_operation/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Configuration operation returned successfully", body = ConfigurationOperation),
            (status = 404, description = "Configuration operation not found", body = ConfigurationOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<ConfigurationOperation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get configuration_operation for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configuration_operations from the database.
    let configuration_operation = state
        .client
        .configuration_operation()
        .find_unique(configuration_operation::id::equals(query.id))
        .exec()
        .await?;

    // If the configuration_operation is not found, return a 404.
    let configuration_operation =
        configuration_operation.ok_or(RouteError::ConfigurationOperationError(
            ConfigurationOperationError::NotFound("Configuration operation not found".to_string()),
        ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the configuration_operation to the format that the API expects.
    let configuration_operation: ConfigurationOperation = configuration_operation.into();

    Ok(Json::from(configuration_operation))
}
