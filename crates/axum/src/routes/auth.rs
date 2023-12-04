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
    error::RouteError,
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    routing::{get, post},
    Json, Router,
};
use ethers_main::{abi::ethereum_types::Signature, types::Address};
use eyre::{eyre, Result};
use lightdotso_tracing::tracing::{error, info};
use serde::{Deserialize, Serialize};
use siwe::{generate_nonce, Message, VerificationOpts};
use std::{
    str::FromStr,
    time::{SystemTime, UNIX_EPOCH},
};
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
        .route("/auth/verify", post(v1_auth_verify_handler))
}

pub const NONCE_KEY: &str = "nonce";
pub const EXPIRATION_TIME_KEY: &str = "expirationTime";
pub const USER_ADDRESS_KEY: &str = "userAddress";

pub fn unix_timestamp() -> Result<u64, eyre::Error> {
    Ok(SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs())
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
    let nonce = generate_nonce();

    match &session.insert(NONCE_KEY, &nonce) {
        Ok(_) => {
            info!("Nonce inserted into session");
        }
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to set nonce.".to_string(),
            ))));
        }
    }
    // Make sure we don't inherit a dirty session expiry
    let ts = match unix_timestamp() {
        Ok(ts) => ts,
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get unix timestamp.".to_string(),
            ))));
        }
    };
    match session.insert(EXPIRATION_TIME_KEY, ts) {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to set expiration.".to_string(),
            ))));
        }
    }

    // // Update the session expiry
    // let expiry = Expiry::AtDateTime(OffsetDateTime::from_unix_timestamp(ts as i64).unwrap());
    // session.set_expiry(Some(expiry));

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

    // The frontend must set a session expiry
    let session_expiry = match session.get::<u64>(EXPIRATION_TIME_KEY) {
        Ok(Some(expiry)) => expiry,
        Ok(None) | Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get expiration.".to_string(),
            ))))
        }
    };

    Ok(Json::from(AuthSession { expiration: session_expiry.to_string() }))
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
    let session_nonce = match session.get::<String>(NONCE_KEY) {
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
    match session.insert(EXPIRATION_TIME_KEY, expiry) {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get insert expiration time.".to_string(),
            ))))
        }
    }
    match session.insert(USER_ADDRESS_KEY, Address::from(message.address)) {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get insert address.".to_string(),
            ))))
        }
    }

    Ok(Json::from(AuthNonce { nonce: session_nonce }))
}
