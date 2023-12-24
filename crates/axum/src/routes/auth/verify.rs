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
    constants::{NONCE_KEY, USER_ID_KEY},
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::auth::{error::AuthError, nonce::AuthNonce},
    sessions::update_session_expiry,
    state::AppState,
};
use axum::{extract::State, Json};
use ethers_main::{abi::ethereum_types::Signature, utils::to_checksum};
use eyre::eyre;
use lightdotso_prisma::user;
use lightdotso_tracing::tracing::{error, info};
use serde::{Deserialize, Serialize};
use siwe::{Message, VerificationOpts};
use std::str::FromStr;
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
pub struct AuthVerifyPostRequestParams {
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
        // request_body = AuthPostRequestParams,
        responses(
            (status = 200, description = "Auth verified successfully", body = AuthNonce),
            (status = 400, description = "Invalid Configuration", body = AuthError),
            (status = 409, description = "Auth already exists", body = AuthError),
            (status = 500, description = "Auth internal error", body = AuthError),
        )
    )]
pub(crate) async fn v1_auth_verify_handler(
    State(state): State<AppState>,
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
    info!(?session_nonce);

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

    // Update the session expiry
    update_session_expiry(&session)?;

    // Upsert the user
    let user = state
        .client
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
