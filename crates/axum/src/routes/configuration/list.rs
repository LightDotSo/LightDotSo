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

#[allow(unused_imports)]
use super::{error::ConfigurationError, types::Configuration};
use crate::result::AppJsonResult;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::configuration;
use lightdotso_state::ClientState;
use prisma_client_rust::Direction;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first configuration to return.
    pub offset: Option<i64>,
    /// The maximum number of configurations to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// List configurations
///
/// Returns a list of configurations with optional filtering.
#[utoipa::path(
        get,
        path = "/configuration/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Configurations returned successfully", body = [Configuration]),
            (status = 500, description = "Configurations bad request", body = ConfigurationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Vec<Configuration>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configurations from the database.
    let configurations = state
        .client
        .configuration()
        .find_many(vec![])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the configurations to the format that the API expects.
    let configurations: Vec<Configuration> =
        configurations.into_iter().map(Configuration::from).collect();

    Ok(Json::from(configurations))
}
