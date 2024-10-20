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

use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::auth::error::AuthError,
    sessions::{update_session_expiry, verify_session},
    tags::AUTH_TAG,
};
use axum::Json;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use time::format_description::well_known::Rfc3339;
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
///
/// Gets the session information.
#[utoipa::path(
        get,
        path = "/auth/session",
        responses(
            (status = 200, description = "Auth session returned successfully", body = AuthSession),
            (status = 404, description = "Auth session not found", body = AuthError),
        ),
        tag = AUTH_TAG.as_str()
    )]
pub(crate) async fn v1_auth_session_handler(session: Session) -> AppJsonResult<AuthSession> {
    info!(?session);

    // Check if the session is authenticated
    let authenticated_res = verify_session(&session).await;
    info!("authenticated_res: {:?}", authenticated_res);

    // Update the session expiration
    update_session_expiry(&session).await?;

    // Get the session expiration
    let session_expiry = session.expiry_date();

    // Convert OffsetDateTime to RFC 3339 string
    let expiration_str = session_expiry.format(&Rfc3339).map_err(|e| {
        AppError::RouteError(RouteError::AuthError(AuthError::InternalError(format!(
            "Failed to format expiration time: {}",
            e
        ))))
    })?;

    Ok(Json::from(AuthSession {
        id: session.id().unwrap_or_default().to_string(),
        expiration: expiration_str,
        is_authenticated: authenticated_res.is_ok(),
    }))
}
