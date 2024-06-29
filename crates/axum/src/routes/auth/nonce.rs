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

use crate::{
    constants::NONCE_KEY,
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::auth::error::AuthError,
    sessions::update_session_expiry,
};
use autometrics::autometrics;
use axum::Json;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use siwe::generate_nonce;
use tower_sessions::Session;
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Auth nonce.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct AuthNonce {
    pub(crate) nonce: String,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<String> for AuthNonce.
impl From<String> for AuthNonce {
    fn from(nonce: String) -> Self {
        Self { nonce }
    }
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

// From: https://github.com/valorem-labs-inc/quay/blob/c3bd80f993e4da735c164c0b66f4bee1d23d5486/src/routes/sessions.rs#L12-L45
// License: MIT
// Gets a nonce from the session, or generates a new one if it doesn't exist.
/// Get a auth nonce
#[utoipa::path(
        get,
        path = "/auth/nonce",
        responses(
            (status = 200, description = "Auth nonce returned successfully", body = AuthNonce),
            (status = 404, description = "Auth nonce not found", body = AuthError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_auth_nonce_handler(session: Session) -> AppJsonResult<AuthNonce> {
    info!(?session);

    let nonce = generate_nonce();

    match &session.insert(&NONCE_KEY, &nonce) {
        Ok(_) => {
            info!("Nonce inserted into session");
        }
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to set nonce.".to_string(),
            ))));
        }
    }

    update_session_expiry(&session)?;

    let auth_nonce: AuthNonce = nonce.into();
    Ok(Json::from(auth_nonce))
}
