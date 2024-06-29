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

use crate::{
    constants::EXPIRATION_TIME_KEY,
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::auth::error::AuthError,
    sessions::{update_session_expiry, verify_session},
};
use axum::Json;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions::Session;
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// The session.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct AuthSession {
    /// The session id.
    id: String,
    /// The session expiration.
    expiration: String,
    /// The authenticated status.
    is_authenticated: bool,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a session
#[utoipa::path(
        get,
        path = "/auth/session",
        responses(
            (status = 200, description = "Auth session returned successfully", body = AuthSession),
            (status = 404, description = "Auth session not found", body = AuthError),
        )
    )]
pub(crate) async fn v1_auth_session_handler(session: Session) -> AppJsonResult<AuthSession> {
    info!(?session);

    // Check if the session is authenticated
    let authenticated = verify_session(&session).is_ok();

    // Update the session expiration
    update_session_expiry(&session)?;

    // Get the session expiration
    let session_expiry = match session.get::<u64>(&EXPIRATION_TIME_KEY) {
        Ok(Some(expiry)) => expiry,
        Ok(None) | Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get expiration.".to_string(),
            ))))
        }
    };

    Ok(Json::from(AuthSession {
        id: session.id().to_string(),
        expiration: session_expiry.to_string(),
        is_authenticated: authenticated,
    }))
}
