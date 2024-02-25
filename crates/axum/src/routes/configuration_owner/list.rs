// Copyright 2023-2024 Light, Inc.
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

use super::types::ConfigurationOwner;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first owner to return.
    pub offset: Option<i64>,
    /// The maximum number of owners to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of owners
#[utoipa::path(
        get,
        path = "/configuration_owner/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "ConfigurationOwners returned successfully", body = [ConfigurationOwner]),
            (status = 500, description = "ConfigurationOwners bad request", body = ConfigurationOwnerError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_owner_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<ConfigurationOwner>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configuration owners from the database.
    let configuration_owners = state
        .client
        .configuration_owner()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the owners to the format that the API expects.
    let configuration_owners: Vec<ConfigurationOwner> =
        configuration_owners.into_iter().map(ConfigurationOwner::from).collect();

    Ok(Json::from(configuration_owners))
}
