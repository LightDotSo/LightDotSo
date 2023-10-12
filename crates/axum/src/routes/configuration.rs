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

use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::configuration;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub address: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first configuration to return.
    pub offset: Option<i64>,
    // The maximum number of configurations to return.
    pub limit: Option<i64>,
}

/// Configuration operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum ConfigurationError {
    // Configuration query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Configuration not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Configuration {
    id: String,
    address: String,
}

// Implement From<configuration::Data> for Configuration.
impl From<configuration::Data> for Configuration {
    fn from(configuration: configuration::Data) -> Self {
        Self { id: configuration.id.to_string(), address: configuration.address.to_string() }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/configuration/get", get(v1_get_handler))
        .route("/configuration/list", get(v1_list_handler))
}

/// Get a configuration
#[utoipa::path(
        get,
        path = "/v1/configuration/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Configuration returned successfully", body = Configuration),
            (status = 404, description = "Configuration not found", body = ConfigurationError),
        )
    )]
#[autometrics]
async fn v1_get_handler(
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
    let configuration = client
        .client
        .unwrap()
        .configuration()
        .find_first(vec![configuration::address::equals(checksum_address)])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .exec()
        .await?;

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(AppError::NotFound)?;

    // Change the configuration to the format that the API expects.
    let configuration: Configuration = configuration.into();

    Ok(Json::from(configuration))
}

/// Returns a list of configurations.
#[utoipa::path(
        get,
        path = "/v1/configuration/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Configurations returned successfully", body = [Configuration]),
            (status = 500, description = "Configuration bad request", body = ConfigurationError),
        )
    )]
#[autometrics]
async fn v1_list_handler(
    pagination: Option<Query<ListQuery>>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Configuration>> {
    // Get the pagination query.
    let Query(pagination) = pagination.unwrap_or_default();

    // Get the configurations from the database.
    let configurations = client
        .client
        .unwrap()
        .configuration()
        .find_many(vec![])
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the configurations to the format that the API expects.
    let configurations: Vec<Configuration> =
        configurations.into_iter().map(Configuration::from).collect();

    Ok(Json::from(configurations))
}
