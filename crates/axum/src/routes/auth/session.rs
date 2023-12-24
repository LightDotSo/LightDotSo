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
