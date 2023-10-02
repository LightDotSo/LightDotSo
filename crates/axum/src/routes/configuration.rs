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
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub address: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PaginationQuery {
    pub offset: Option<i64>,
    pub limit: Option<i64>,
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
    Router::new().route("/configuration/get", get(v1_get_handler))
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
        )
    )]
#[autometrics]
async fn v1_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Configuration> {
    // Get the get query.
    let Query(query) = get;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the configurations from the database.
    let configuration = client
        .client
        .unwrap()
        .configuration()
        .find_first(vec![configuration::address::equals(checksum_address)])
        .exec()
        .await?;

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(AppError::NotFound)?;

    // Change the configuration to the format that the API expects.
    let configuration: Configuration = configuration.into();

    Ok(Json::from(configuration))
}
