// Copyright 2023-2024 LightDotSo.
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

use super::types::InviteCode;
use crate::{
    error::RouteError, result::AppJsonResult, routes::invite_code::error::InviteCodeError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::invite_code;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The code of the invite code.
    pub code: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a paymaster
#[utoipa::path(
        get,
        path = "/invite_code/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Invite code returned successfully", body = InviteCode),
            (status = 404, description = "Invite code not found", body = InviteCodeError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_invite_code_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<InviteCode> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the paymasters from the database.
    let invite_code = state
        .client
        .invite_code()
        .find_unique(invite_code::code::equals(query.code))
        .exec()
        .await?;

    // If the paymaster is not found, return a 404.
    let invite_code = invite_code.ok_or(RouteError::InviteCodeError(InviteCodeError::NotFound(
        "Invite code not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the invite code to the format that the API expects.
    let invite_code: InviteCode = invite_code.into();

    Ok(Json::from(invite_code))
}
