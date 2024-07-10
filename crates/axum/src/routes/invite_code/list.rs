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
use crate::{authentication::authenticate_user, result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    headers::{authorization::Bearer, Authorization},
    Json, TypedHeader,
};
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
    /// The id of the user to return invite codes for.
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

/// Returns a list of invite codes
#[utoipa::path(
        get,
        path = "/invite_code/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Invite codes returned successfully", body = [InviteCode]),
            (status = 500, description = "Invite code bad request", body = InviteCodeError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_invite_code_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<Vec<InviteCode>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = authenticate_user(
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
        query.user_id,
    )
    .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_invite_code_list_query_params(auth_user_id);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the invite codes from the database.
    let invite_codes = state
        .client
        .invite_code()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the invite codes to the format that the API expects.
    let invite_codes: Vec<InviteCode> = invite_codes.into_iter().map(InviteCode::from).collect();

    Ok(Json::from(invite_codes))
}

/// Returns a count of list of invite codes
#[utoipa::path(
        get,
        path = "/invite_code/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Invite codes returned successfully", body = InviteCodeListCount),
            (status = 500, description = "Invite code bad request", body = InviteCodeError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_invite_code_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<InviteCodeListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = authenticate_user(
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
        query.user_id,
    )
    .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_invite_code_list_query_params(auth_user_id);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the invite codes from the database.
    let count = state.client.invite_code().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(InviteCodeListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for invite codes.
fn construct_invite_code_list_query_params(user_id: String) -> Vec<WhereParam> {
    vec![invite_code::user_id::equals(user_id)]
}
