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

use super::types::User;
use crate::{
    error::RouteError, result::AppJsonResult, routes::user::error::UserError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::user;
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
    /// The address of the user.
    pub address: Option<String>,
    /// The user id.
    pub user_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a user
#[utoipa::path(
        get,
        path = "/user/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User returned successfully", body = User),
            (status = 404, description = "User not found", body = UserError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<User> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get user for address: {:?}", query);

    let query_address: Option<H160> = query.address.as_ref().and_then(|s| s.parse().ok());

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the user from the database.
    let user = if let Some(addr) = query_address {
        state
            .client
            .user()
            .find_unique(user::address::equals(to_checksum(&addr, None)))
            .exec()
            .await?
    } else if let Some(user_id) = query.user_id {
        state.client.user().find_unique(user::id::equals(user_id)).exec().await?
    } else {
        None
    };

    // If the user is not found, return a 404.
    let user =
        user.ok_or(RouteError::UserError(UserError::NotFound("User not found".to_string())))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the user to the format that the API expects.
    let user: User = user.into();

    Ok(Json::from(user))
}
