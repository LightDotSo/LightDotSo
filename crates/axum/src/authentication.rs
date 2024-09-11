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

#![allow(clippy::unwrap_used)]

use crate::{
    admin::token_is_valid,
    error::RouteError,
    result::{AppError, AppResult},
    routes::{auth::error::AuthError, user::error::UserError, wallet::error::WalletError},
    sessions::get_user_id,
    state::AppState,
};
use alloy::primitives::Address;
use lightdotso_prisma::{configuration, user, wallet};
use lightdotso_tracing::tracing::info;
use tower_sessions_core::Session;

/// Authenticate the user.
/// Returns the user id of the authenticated user.
/// If the user is not authenticated, return a 401.
/// Can bypass the authentication by passing in a token. (for admin routes)
/// Expects for the admin endpoint to specify a user address.
pub(crate) async fn authenticate_user(
    state: &AppState,
    session: &mut Session,
    token: Option<String>,
    user_id: Option<String>,
) -> AppResult<String> {
    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    if let Some(token) = token {
        let is_admin = token_is_valid(&token);

        // If the token is not valid, return a 401.
        if !is_admin {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::Unauthorized(
                "Unauthorized Admin Token".to_string(),
            ))));
        }

        if let Some(id) = user_id {
            // Get the user from the database.
            let user = state.client.user().find_unique(user::id::equals(id)).exec().await?;

            // If the user is not found, return a 404.
            let user = user
                .clone()
                .ok_or(RouteError::UserError(UserError::NotFound("User not found".to_string())))?;

            return Ok(user.id);
        }

        // Should be unreachable (token provided, but no user id).
        return Err(AppError::RouteError(RouteError::AuthError(AuthError::Unauthorized(
            "Unauthorized Admin Token".to_string(),
        ))));
    }

    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id from the session.
    let auth_user_id = get_user_id(session).await?;
    info!(?auth_user_id);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(auth_user_id)
}

/// Authenticate the wallet user.
/// Returns the user id of the authenticated user, if the user is an owner of the wallet.
/// If the user is not authenticated, return a 401.
/// Make sure to check to see if the user is an owner of the wallet (for mainly data changes that
/// are invoked from a particular user).
/// If a token is provided, authenticate the user w/ the user id.
pub(crate) async fn authenticate_wallet_user(
    state: &AppState,
    session: &mut Session,
    wallet: &Address,
    token: Option<String>,
    user_id: Option<String>,
) -> AppResult<String> {
    // -------------------------------------------------------------------------
    // Auth + Session
    // -------------------------------------------------------------------------

    // If the token is provided, authenticate the user.
    let auth_user_id = if token.is_some() {
        authenticate_user(state, session, token, user_id).await?
    } else {
        get_user_id(session).await?
    };

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallets from the database.
    let wallet = state
        .client
        .wallet()
        .find_unique(wallet::address::equals(wallet.to_checksum(None)))
        .with(wallet::configurations::fetch(vec![]).with(configuration::owners::fetch(vec![])))
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet
        .clone()
        .ok_or(RouteError::WalletError(WalletError::NotFound("Wallet not found".to_string())))?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Check to see if the user is one of the owners of the wallet configurations.
    let _ = wallet
        .configurations
        .unwrap()
        .iter()
        .find(|configuration| {
            configuration
                .owners
                .as_ref()
                .unwrap()
                .iter()
                .any(|owner| owner.clone().user_id.as_ref().unwrap() == &auth_user_id)
        })
        .ok_or(RouteError::WalletError(WalletError::BadRequest(
            "User is not an owner of the wallet".to_string(),
        )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(auth_user_id)
}
