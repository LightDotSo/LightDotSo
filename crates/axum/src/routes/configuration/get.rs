// Copyright 2023-2024 Light.
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

use super::types::Configuration;
use crate::{
    error::RouteError, result::AppJsonResult, routes::configuration::error::ConfigurationError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{configuration, owner};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the configuration to query.
    pub address: String,
    /// The optional image_hash to filter by.
    pub image_hash: Option<String>,
    /// The optional checkpoint to filter by.
    pub checkpoint: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a configuration
#[utoipa::path(
        get,
        path = "/configuration/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Configuration returned successfully", body = Configuration),
            (status = 404, description = "Configuration not found", body = ConfigurationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Configuration> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get configuration for address: {:?}", query);

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    info!("Get configuration for checksum address: {:?}", checksum_address);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configurations from the database.
    let configuration = match query.image_hash {
        Some(image_hash) => {
            state
                .client
                .configuration()
                .find_unique(configuration::address_image_hash(checksum_address, image_hash))
                .with(configuration::owners::fetch(vec![]).with(owner::user::fetch()))
                .exec()
                .await?
        }
        None => match query.checkpoint {
            Some(checkpoint) => {
                state
                    .client
                    .configuration()
                    .find_unique(configuration::address_checkpoint(checksum_address, checkpoint))
                    .with(configuration::owners::fetch(vec![]).with(owner::user::fetch()))
                    .exec()
                    .await?
            }
            None => {
                state
                    .client
                    .configuration()
                    .find_first(vec![configuration::address::equals(checksum_address)])
                    .order_by(configuration::checkpoint::order(Direction::Desc))
                    .with(configuration::owners::fetch(vec![]).with(owner::user::fetch()))
                    .exec()
                    .await?
            }
        },
    };

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(RouteError::ConfigurationError(
        ConfigurationError::NotFound("Configuration not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the configuration to the format that the API expects.
    let configuration: Configuration = configuration.into();

    Ok(Json::from(configuration))
}
