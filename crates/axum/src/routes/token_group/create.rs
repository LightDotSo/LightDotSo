// Copyright 2023-2024 Light
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

use super::types::TokenGroup;
use crate::{
    constants::KAKI_USER_ID, error::RouteError, result::AppJsonResult,
    routes::token_group::error::TokenGroupError, sessions::get_user_id, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{token, token_group};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use tower_sessions_core::Session;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The id of the token id to post for.
    token_id: String,
    /// The optional id of the token group.
    group_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a token group
#[utoipa::path(
        post,
        path = "/token/group/create",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Token group created successfully", body = TokenGroup),
            (status = 500, description = "Token group internal error", body = TokenGroupError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_token_group_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    mut session: Session,
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

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;

    // Get the token id from the post query.
    let token_id = query.token_id;

    // Get the optional group id from the post query.
    let group_id = query.group_id;

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
