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

use crate::{error::RouteError, result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{configuration, owner};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub address: String,
    /// The optional checkpoint to filter by.
    pub checkpoint: Option<i64>,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first configuration to return.
    pub offset: Option<i64>,
    /// The maximum number of configurations to return.
    pub limit: Option<i64>,
}

/// Configuration operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum ConfigurationError {
    /// Configuration query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Configuration not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Configuration {
    /// The id of the configuration.
    id: String,
    /// The address of the configuration.
    address: String,
    /// The image hash of the configuration.
    image_hash: String,
    /// The checkpoint of the configuration.
    checkpoint: i64,
    /// The threshold of the configuration.
    threshold: i64,
    /// The owners of the configuration.
    owners: Vec<ConfigurationOwner>,
}

/// Owner
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct ConfigurationOwner {
    /// The id of the owner.
    id: String,
    /// The index of the owner.
    index: i32,
    /// The address of the owner.
    address: String,
    /// The weight of the owner.
    weight: i64,
}

// Implement From<configuration::Data> for Configuration.
impl From<configuration::Data> for Configuration {
    fn from(configuration: configuration::Data) -> Self {
        Self {
            id: configuration.id.to_string(),
            address: configuration.address.to_string(),
            image_hash: configuration.image_hash.to_string(),
            checkpoint: configuration.checkpoint,
            threshold: configuration.threshold,
            owners: configuration.owners.map_or(Vec::new(), |owners| {
                owners.into_iter().map(ConfigurationOwner::from).collect()
            }),
        }
    }
}

// Implement From<owner::Data> for Owner.
impl From<owner::Data> for ConfigurationOwner {
    fn from(owner: owner::Data) -> Self {
        Self {
            id: owner.id.to_string(),
            address: owner.address.to_string(),
            index: owner.index,
            weight: owner.weight,
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/configuration/get", get(v1_configuration_get_handler))
        .route("/configuration/list", get(v1_configuration_list_handler))
}

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
async fn v1_configuration_get_handler(
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
                .unwrap()
                .configuration()
                .find_unique(configuration::address_checkpoint(checksum_address, checkpoint))
                .with(configuration::owners::fetch(vec![]))
                .exec()
                .await?
        }
        None => {
            client
                .client
                .unwrap()
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

/// Returns a list of configurations.
#[utoipa::path(
        get,
        path = "/configuration/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Configurations returned successfully", body = [Configuration]),
            (status = 500, description = "Configuration bad request", body = ConfigurationError),
        )
    )]
#[autometrics]
async fn v1_configuration_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Configuration>> {
    // Get the pagination query.
    let Query(pagination) = pagination;

    // Get the configurations from the database.
    let configurations = client
        .client
        .unwrap()
        .configuration()
        .find_many(vec![])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the configurations to the format that the API expects.
    let configurations: Vec<Configuration> =
        configurations.into_iter().map(Configuration::from).collect();

    Ok(Json::from(configurations))
}
