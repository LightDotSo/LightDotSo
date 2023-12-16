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
