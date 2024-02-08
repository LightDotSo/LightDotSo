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

use super::types::WalletNotificationSettings;
use crate::{
    authentication::{authenticate_user, authenticate_wallet_user},
    error::RouteError,
    result::{AppError, AppJsonResult, AppResult},
    routes::wallet_notification_settings::error::WalletNotificationSettingsError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    headers::{authorization::Bearer, Authorization},
    Json, TypedHeader,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_notifier::types::WALLET_NOTIFICATION_KEYS;
use lightdotso_prisma::{notification_settings, user, wallet, wallet_notification_settings};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use tower_sessions_core::Session;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the wallet settings.
    pub wallet_address: String,
    /// The user id to filter by. (for admin purposes only)
    pub user_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a wallet notification settings
#[utoipa::path(
        get,
        path = "/wallet/notification/settings/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Wallet Settings returned successfully", body = WalletNotificationSettings),
            (status = 404, description = "Wallet Settings not found", body = WalletNotificationSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_notification_settings_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<WalletNotificationSettings> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    let parsed_query_address: H160 = query.wallet_address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    info!("Get wallet_notification_settings for address: {:?}", checksum_address);

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    let auth_user_id = authenticate_user_id(
        &query,
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
    )
    .await?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let wallet_notification_settings = state
        .client
        .wallet_notification_settings()
        .find_unique(wallet_notification_settings::user_id_wallet_address(
            auth_user_id.clone(),
            checksum_address.clone(),
        ))
        .with(wallet_notification_settings::notification_settings::fetch(vec![]))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    if let Some(wallet_notification_settings) = wallet_notification_settings {
        let mut missing_notification_settings = vec![];

        // Compare the notification settings with the wallet notification keys.
        if let Some(notification_settings) =
            wallet_notification_settings.clone().notification_settings
        {
            for key in WALLET_NOTIFICATION_KEYS.iter() {
                for setting in notification_settings.iter() {
                    // if none match, add the missing notification setting.
                    if setting.key != *key {
                        missing_notification_settings.push(key.clone());
                    }
                }
            }
        }

        // If there are missing notification settings, add them to the wallet notification settings.
        if !missing_notification_settings.is_empty() {
            // -----------------------------------------------------------------
            // DB
            // -----------------------------------------------------------------

            let _ = state
                .client
                .notification_settings()
                .create_many(
                    missing_notification_settings
                        .iter()
                        .map(|key| {
                            (
                                key.clone(),
                                true,
                                auth_user_id.clone(),
                                vec![
                                    notification_settings::wallet_address::set(Some(
                                        checksum_address.clone(),
                                    )),
                                    notification_settings::wallet_notification_settings_id::set(
                                        Some(wallet_notification_settings.clone().id),
                                    ),
                                ],
                            )
                        })
                        .collect(),
                )
                .exec()
                .await?;

            // Get the wallet notification settings again.
            let wallet_notification_settings = state
                .client
                .wallet_notification_settings()
                .find_unique(wallet_notification_settings::user_id_wallet_address(
                    auth_user_id.clone(),
                    checksum_address.clone(),
                ))
                .with(wallet_notification_settings::notification_settings::fetch(vec![]))
                .exec()
                .await?;

            // If the wallet is not found, return a 404.
            let wallet_notification_settings = wallet_notification_settings.clone().ok_or(
                RouteError::WalletNotificationSettingsError(
                    WalletNotificationSettingsError::NotFound(
                        "Wallet notification not found".to_string(),
                    ),
                ),
            )?;

            // -----------------------------------------------------------------
            // Return
            // -----------------------------------------------------------------

            let wallet_notification_settings: WalletNotificationSettings =
                wallet_notification_settings.into();

            return Ok(Json::from(wallet_notification_settings));
        }

        // ---------------------------------------------------------------------
        // Return
        // ---------------------------------------------------------------------

        let wallet_notification_settings: WalletNotificationSettings =
            wallet_notification_settings.into();

        Ok(Json::from(wallet_notification_settings))
    } else {
        // ---------------------------------------------------------------------
        // DB
        // ---------------------------------------------------------------------

        let wallet = state
            .client
            .wallet()
            .find_unique(wallet::address::equals(checksum_address.clone()))
            .exec()
            .await?;

        if wallet.is_none() {
            return Err(AppError::RouteError(RouteError::WalletNotificationSettingsError(
                WalletNotificationSettingsError::NotFound(
                    "Wallet notification not found".to_string(),
                ),
            )));
        }

        let wallet_notification_settings = state
            .client
            .wallet_notification_settings()
            .create(
                user::id::equals(auth_user_id.clone()),
                wallet::address::equals(checksum_address.clone()),
                vec![],
            )
            .exec()
            .await?;

        // ---------------------------------------------------------------------
        // Return
        // ---------------------------------------------------------------------

        let wallet_notification_settings: WalletNotificationSettings =
            wallet_notification_settings.into();

        return Ok(Json::from(wallet_notification_settings));
    }
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Authenticates the user and returns the user id.
async fn authenticate_user_id(
    query: &GetQuery,
    state: &AppState,
    session: &mut Session,
    auth_token: Option<String>,
) -> AppResult<String> {
    // Parse the address.
    let parsed_query_address: H160 = query.wallet_address.parse()?;

    // If the user id is provided, authenticate the user.
    let auth_user_id = if query.user_id.is_some() {
        authenticate_user(state, session, auth_token, query.user_id.clone()).await?
    } else {
        authenticate_wallet_user(state, session, &parsed_query_address, None, None).await?
    };

    Ok(auth_user_id)
}
