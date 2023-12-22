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
    // Get the get query.
    let Query(query) = get_query;

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

    // Change the invite code to the format that the API expects.
    let invite_code: InviteCode = invite_code.into();

    Ok(Json::from(invite_code))
}
