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

use super::types::TokenGroup;
use crate::{
    constants::KAKI_USER_ID, error::RouteError, result::AppJsonResult,
    routes::token_group::error::TokenGroupError, sessions::get_user_id, state::AppState,
};
use autometrics::autometrics;
use axum::{extract::State, Json};
use lightdotso_prisma::{token, token_group};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenGroupPostRequestParams {
    /// The id of the token id to post for.
    token_id: String,
    /// The optional id of the token group.
    group_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a tokengroup.
#[utoipa::path(
        post,
        path = "/token/group/create",
        responses(
            (status = 200, description = "Token group created successfully", body = TokenGroup),
            (status = 500, description = "Token group internal error", body = TokenGroupError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_token_group_create_handler(
    State(state): State<AppState>,
    mut session: Session,
    Json(params): Json<TokenGroupPostRequestParams>,
) -> AppJsonResult<TokenGroup> {
    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session)?;
    info!(?auth_user_id);

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    // If the authenticated user id is not `KAKI_USER_ID`, return an error.
    if auth_user_id != KAKI_USER_ID.to_string() {
        return Err(RouteError::TokenGroupError(TokenGroupError::Unauthorized(format!(
            "Not authorized for {}",
            auth_user_id
        )))
        .into());
    }

    // Get the token id from the post body.
    let token_id = params.token_id;

    // Get the group id from the post body.
    let group_id = params.group_id;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // If the group id is `None`, create a new token group.
    let token_group = match group_id {
        Some(id) => {
            // Get the token group by id.
            state
                .client
                .token_group()
                .find_unique(token_group::id::equals(id.clone()))
                .exec()
                .await?
                .ok_or_else(|| {
                    RouteError::TokenGroupError(TokenGroupError::NotFound(format!(
                        "Token group not found by id: {}",
                        id
                    )))
                })?
        }
        None => {
            // Create a new token group.
            state.client.token_group().create(vec![]).exec().await?
        }
    };

    // Find the token by id.
    let token = state
        .client
        .token()
        .find_unique(token::id::equals(token_id.clone()))
        .exec()
        .await?
        .ok_or_else(|| {
            RouteError::TokenGroupError(TokenGroupError::NotFound(format!(
                "Token not found by id: {}",
                token_id
            )))
        })?;

    // If the group is already in the toke, return an error.
    if token.group_id.is_some() {
        return Err(RouteError::TokenGroupError(TokenGroupError::BadRequest(
            "Token already in group".to_string(),
        ))
        .into());
    }

    // Add the token to the token group.
    let token_group = state
        .client
        .token_group()
        .update(
            token_group::id::equals(token_group.id),
            vec![token_group::tokens::connect(vec![token::id::equals(token_id)])],
        )
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the token group to the format that the API expects.
    let token_group: TokenGroup = token_group.into();

    Ok(Json::from(token_group))
}
