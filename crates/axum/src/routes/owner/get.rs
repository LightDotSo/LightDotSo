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

use super::types::Owner;
use crate::{
    error::RouteError, result::AppJsonResult, routes::owner::error::OwnerError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::owner;
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
        path = "/owner/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Owner returned successfully", body = Owner),
            (status = 404, description = "Owner not found", body = OwnerError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_owner_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Owner> {
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
    let owner = state.client.owner().find_unique(owner::id::equals(query.id)).exec().await?;

    // If the owner is not found, return a 404.
    let owner =
        owner.ok_or(RouteError::OwnerError(OwnerError::NotFound("Owner not found".to_string())))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the owner to the format that the API expects.
    let owner: Owner = owner.into();

    Ok(Json::from(owner))
}
