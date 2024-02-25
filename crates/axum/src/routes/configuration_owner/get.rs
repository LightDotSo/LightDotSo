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
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::configuration_owner::error::ConfigurationOwnerError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::configuration_owner;
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

/// Get a owner
#[utoipa::path(
        get,
        path = "/configuration_owner/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "ConfigurationOwner returned successfully", body = ConfigurationOwner),
            (status = 404, description = "ConfigurationOwner not found", body = ConfigurationOwnerError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_owner_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<ConfigurationOwner> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get owner for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the owners from the database.
    let configuration_owner = state
        .client
        .configuration_owner()
        .find_unique(configuration_owner::id::equals(query.id))
        .exec()
        .await?;

    // If the configuration owner is not found, return a 404.
    let configuration_owner = configuration_owner.ok_or(RouteError::ConfigurationOwnerError(
        ConfigurationOwnerError::NotFound("ConfigurationOwner not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the owner to the format that the API expects.
    let configuration_owner: ConfigurationOwner = configuration_owner.into();

    Ok(Json::from(configuration_owner))
}
