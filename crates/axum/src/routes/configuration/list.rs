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
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::configuration;
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

/// Returns a list of configurations.
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
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Configuration>> {
    // Get the list query.
    let Query(query) = list_query;

    // Get the configurations from the database.
    let configurations = client
        .client
        .configuration()
        .find_many(vec![])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the configurations to the format that the API expects.
    let configurations: Vec<Configuration> =
        configurations.into_iter().map(Configuration::from).collect();

    Ok(Json::from(configurations))
}
