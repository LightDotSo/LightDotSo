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
use crate::sessions::get_user_id;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::extract::{Query, State};
use axum::Json;
use lightdotso_prisma::invite_code::{self, WhereParam};
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first invite code to return.
    pub offset: Option<i64>,
    /// The maximum number of invite codes to return.
    pub limit: Option<i64>,
    /// The user id to filter by.
    pub user_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of user operations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct InviteCodeListCount {
    /// The count of the list of user operations..
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of invite codes.
#[utoipa::path(
        get,
        path = "/invite_code/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Invite Codes returned successfully", body = [InviteCode]),
            (status = 500, description = "InviteCode bad request", body = InviteCodeError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_invite_code_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
) -> AppJsonResult<Vec<InviteCode>> {
    // Get the list query.
    let Query(query) = list_query;

    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session)?;

    // If the address is provided, add it to the query.
    let query_params = construct_invite_code_list_query_params(auth_user_id);

    // Get the invite codes from the database.
    let invite_codes = state
        .client
        .invite_code()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the invite codes to the format that the API expects.
    let invite_codes: Vec<InviteCode> = invite_codes.into_iter().map(InviteCode::from).collect();

    Ok(Json::from(invite_codes))
}

/// Returns a count of list of invite codes.
#[utoipa::path(
        get,
        path = "/invite_code/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Invite Codes returned successfully", body = InviteCodeListCount),
            (status = 500, description = "InviteCode bad request", body = InviteCodeError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_invite_code_list_count_handler(
    State(state): State<AppState>,
    mut session: Session,
) -> AppJsonResult<InviteCodeListCount> {
    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session)?;

    // If the address is provided, add it to the query.
    let query_params = construct_invite_code_list_query_params(auth_user_id);

    // Get the invite codes from the database.
    let count = state.client.invite_code().count(query_params).exec().await?;

    Ok(Json::from(InviteCodeListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for invite codes.
fn construct_invite_code_list_query_params(user_id: String) -> Vec<WhereParam> {
    vec![invite_code::user_id::equals(user_id)]
}
