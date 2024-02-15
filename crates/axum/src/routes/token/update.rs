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

use crate::{
    constants::KAKI_USER_ID,
    error::RouteError,
    result::AppJsonResult,
    routes::token::{error::TokenError, types::Token},
    sessions::get_user_id,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::token;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PutQuery {
    /// The id of the token id to post for.
    token_id: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct TokenUpdateRequestParams {
    /// The name of the wallet.
    #[schema(example = "My Token", default = "My Token")]
    pub name: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update a token
#[utoipa::path(
        put,
        path = "/token/update",
        params(
            PutQuery
        ),
        request_body = TokenUpdateRequestParams,
        responses(
            (status = 200, description = "Token updated successfully", body = Token),
            (status = 500, description = "Token internal error", body = TokenError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_token_update_handler(
    State(state): State<AppState>,
    mut session: Session,
    put_query: Query<PutQuery>,
    Json(params): Json<TokenUpdateRequestParams>,
) -> AppJsonResult<Token> {
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
        return Err(RouteError::TokenError(TokenError::Unauthorized(format!(
            "Not authorized for {}",
            auth_user_id
        )))
        .into());
    }

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the put query.
    let Query(query) = put_query;

    // Get the token id from the post query.
    let token_id = query.token_id;
    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Update the token.
    let token = state
        .client
        .token()
        .update(token::id::equals(token_id), vec![token::name::set(params.name)])
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the token to the format that the API expects.
    let token: Token = token.into();

    Ok(Json::from(token))
}
