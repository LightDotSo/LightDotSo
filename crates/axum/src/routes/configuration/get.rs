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
use lightdotso_prisma::configuration;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the configuration to query.
    pub address: String,
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
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Configuration> {
    // Get the get query.
    let Query(query) = get;

    info!("Get configuration for address: {:?}", query);

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    info!("Get configuration for checksum address: {:?}", checksum_address);

    // Get the configurations from the database.
    let configuration = match query.checkpoint {
        Some(checkpoint) => {
            client
                .client
                .configuration()
                .find_unique(configuration::address_checkpoint(checksum_address, checkpoint))
                .with(configuration::owners::fetch(vec![]))
                .exec()
                .await?
        }
        None => {
            client
                .client
                .configuration()
                .find_first(vec![configuration::address::equals(checksum_address)])
                .order_by(configuration::checkpoint::order(Direction::Desc))
                .with(configuration::owners::fetch(vec![]))
                .exec()
                .await?
        }
    };

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(RouteError::ConfigurationError(
        ConfigurationError::NotFound("Configuration not found".to_string()),
    ))?;

    // Change the configuration to the format that the API expects.
    let configuration: Configuration = configuration.into();

    Ok(Json::from(configuration))
}
