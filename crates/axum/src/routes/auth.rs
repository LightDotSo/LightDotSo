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
    constants::{EXPIRATION_TIME_KEY, NONCE_KEY, USER_ID_KEY},
    error::RouteError,
    result::{AppError, AppJsonResult},
    sessions::{unix_timestamp, update_session_expiry, verify_session},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use ethers_main::{abi::ethereum_types::Signature, utils::to_checksum};
use eyre::eyre;
use lightdotso_prisma::user;
use lightdotso_tracing::tracing::{error, info};
use serde::{Deserialize, Serialize};
use siwe::{generate_nonce, Message, VerificationOpts};
use std::str::FromStr;
use tower_sessions::Session;
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The hash of the user operation.
    pub user_address: String,
}

/// Auth operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum AuthError {
    // Auth query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Auth not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
    /// Internal error.
    #[schema(example = "Internal error")]
    InternalError(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct AuthNonce {
    nonce: String,
}

/// The session.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct AuthSession {
    /// The session id.
    id: String,
    /// The session expiration.
    expiration: String,
}

// Implement From<String> for AuthNonce.
impl From<String> for AuthNonce {
    fn from(nonce: String) -> Self {
        Self { nonce }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct AuthVerifyPostRequestParams {
    // The signature of the message.
    pub signature: String,
    // The message that was signed.
    pub message: String,
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/nonce", get(v1_auth_nonce_handler))
        .route("/auth/session", get(v1_auth_session_handler))
        .route("/auth/logout", post(v1_auth_logout_handler))
        .route("/auth/verify", post(v1_auth_verify_handler))
}

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
async fn v1_auth_nonce_handler(session: Session) -> AppJsonResult<AuthNonce> {
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

/// Get a session
#[utoipa::path(
        get,
        path = "/auth/session",
        responses(
            (status = 200, description = "Auth session returned successfully", body = AuthSession),
            (status = 404, description = "Auth session not found", body = AuthError),
        )
    )]
async fn v1_auth_session_handler(session: Session) -> AppJsonResult<AuthSession> {
    info!(?session);

    verify_session(&session)?;

    // The frontend must set a session expiry
    let session_expiry = match session.get::<u64>(&EXPIRATION_TIME_KEY) {
        Ok(Some(expiry)) => expiry,
        Ok(None) | Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get expiration.".to_string(),
            ))))
        }
    };

    update_session_expiry(&session)?;

    Ok(Json::from(AuthSession {
        id: session.id().to_string(),
        expiration: session_expiry.to_string(),
    }))
}

/// Logout a session
#[utoipa::path(
        post,
        path = "/auth/logout",
        responses(
            (status = 200, description = "Auth logout returned successfully", body = ()),
            (status = 404, description = "Auth logout not succeeded", body = AuthError),
        )
    )]
async fn v1_auth_logout_handler(session: Session) -> AppJsonResult<()> {
    info!(?session);

    session.clear();

    Ok(Json::from(()))
}

/// Verify a auth
#[utoipa::path(
        post,
        path = "/auth/verify",
        params(
            PostQuery
        ),
        // request_body = AuthPostRequestParams,
        responses(
            (status = 200, description = "Auth verified successfully", body = AuthNonce),
            (status = 400, description = "Invalid Configuration", body = AuthError),
            (status = 409, description = "Auth already exists", body = AuthError),
            (status = 500, description = "Auth internal error", body = AuthError),
        )
    )]
async fn v1_auth_verify_handler(
    State(client): State<AppState>,
    session: Session,
    Json(msg): Json<AuthVerifyPostRequestParams>,
) -> AppJsonResult<AuthNonce> {
    info!(?session);

    // Parse the message
    let message = Message::from_str(&msg.message).map_err(|e| {
        error!("Failed to parse message: {:?}", e);
        eyre!("Failed to map signature")
    })?;
    let signature = Signature::from_str(&msg.signature).map_err(|e| {
        error!("Failed to parse signature: {:?}", e);
        eyre!("Failed to map signature")
    })?;

    // The frontend must set a session expiry
    let session_nonce = match session.get::<String>(&NONCE_KEY) {
        Ok(Some(nonce)) => nonce,
        Ok(None) | Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get nonce.".to_string(),
            ))))
        }
    };

    // Verify the signed message
    match message
        .verify(
            signature.as_ref(),
            &VerificationOpts { nonce: Some(session_nonce.clone()), ..Default::default() },
        )
        .await
    {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::BadRequest(
                "Invalid Signature.".to_string(),
            ))))
        }
    }
    let now = match unix_timestamp() {
        Ok(now) => now,
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get timestamp.".to_string(),
            ))))
        }
    };
    let expiry = now + 604800;
    match session.insert(&EXPIRATION_TIME_KEY, expiry) {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get insert expiration time.".to_string(),
            ))))
        }
    }

    // Upsert the user
    let user = client
        .client
        .unwrap()
        .user()
        .upsert(
            user::address::equals(to_checksum(&message.address.into(), None)),
            user::create(to_checksum(&message.address.into(), None), vec![]),
            vec![],
        )
        .exec()
        .await?;
    info!(?user);

    // Insert the user id into the session
    match session.insert(&USER_ID_KEY, user.id) {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get insert user id.".to_string(),
            ))))
        }
    }

    Ok(Json::from(AuthNonce { nonce: session_nonce }))
}
