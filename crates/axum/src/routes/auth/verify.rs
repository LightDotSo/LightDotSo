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
    constants::{NONCE_KEY, USER_ID_KEY},
    cookies::CookieUtility,
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::auth::{error::AuthError, nonce::AuthNonce},
    sessions::update_session_expiry,
    state::AppState,
};
use alloy::{primitives::Address, signers::Signature};
use axum::{extract::State, Json};
use eyre::eyre;
use lightdotso_prisma::user;
use lightdotso_tracing::tracing::{error, info};
use serde::{Deserialize, Serialize};
use siwe::{Message, VerificationOpts};
use std::str::FromStr;
use tower_cookies::Cookies;
use tower_sessions::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The hash of the user operation.
    pub user_address: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct AuthVerifyCreateRequestParams {
    // The signature of the message.
    pub signature: String,
    // The message that was signed.
    pub message: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Verify a auth
#[utoipa::path(
        post,
        path = "/auth/verify",
        params(
            PostQuery
        ),
        // request_body = AuthCreateRequestParams,
        responses(
            (status = 200, description = "Auth verified successfully", body = AuthNonce),
            (status = 400, description = "Invalid configuration", body = AuthError),
            (status = 409, description = "Auth already exists", body = AuthError),
            (status = 500, description = "Auth internal error", body = AuthError),
        )
    )]
pub(crate) async fn v1_auth_verify_handler(
    State(state): State<AppState>,
    cookies: Cookies,
    session: Session,
    Json(msg): Json<AuthVerifyCreateRequestParams>,
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
    info!(?session_nonce);

    // Verify the signed message
    match message
        .verify(
            &signature.as_bytes(),
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

    // Update the session expiry
    update_session_expiry(&session)?;

    // Upsert the user
    let user = state
        .client
        .user()
        .upsert(
            user::address::equals(Address::from_slice(&message.address).to_checksum(None)),
            user::create(Address::from_slice(&message.address).to_checksum(None), vec![]),
            vec![],
        )
        .exec()
        .await?;
    info!(?user);

    // Insert the user id into the session
    match session.insert(&USER_ID_KEY, user.clone().id) {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get insert user id.".to_string(),
            ))))
        }
    }

    // Adds the user cookie
    cookies.add_user_cookie(user.id).await;

    Ok(Json::from(AuthNonce { nonce: session_nonce }))
}
