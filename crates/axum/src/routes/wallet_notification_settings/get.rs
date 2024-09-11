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

use super::types::WalletNotificationSettings;
use crate::{
    authentication::{authenticate_user, authenticate_wallet_user},
    error::RouteError,
    result::{AppError, AppJsonResult, AppResult},
    routes::wallet_notification_settings::error::WalletNotificationSettingsError,
    state::AppState,
};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use lightdotso_notifier::types::{WALLET_NOTIFICATION_DEFAULT_ENABLED, WALLET_NOTIFICATION_KEYS};
use lightdotso_prisma::{notification_settings, user, wallet, wallet_notification_settings};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use std::collections::HashSet;
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
    pub address: String,
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
            (status = 200, description = "Wallet settings returned successfully", body = WalletNotificationSettings),
            (status = 404, description = "Wallet settings not found", body = WalletNotificationSettingsError),
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

    let parsed_query_address: Address = query.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);

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
            // Create a HashSet for quicker lookup
            let settings_keys: HashSet<_> =
                notification_settings.iter().map(|s| s.key.clone()).collect();

            for key in WALLET_NOTIFICATION_KEYS.iter() {
                // Check if the key exists in settings_keys
                if !settings_keys.contains(key) {
                    missing_notification_settings.push(key.clone());
                }
            }
        } else {
            missing_notification_settings = WALLET_NOTIFICATION_KEYS.to_vec();
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
                                *WALLET_NOTIFICATION_DEFAULT_ENABLED.get(key).unwrap_or(&false),
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

        let _ = state.client.notification_settings().create_many(
            WALLET_NOTIFICATION_DEFAULT_ENABLED
                .iter()
                .map(|(key, value)| {
                    (
                        key.clone(),
                        *value,
                        auth_user_id.clone(),
                        vec![
                            notification_settings::wallet_address::set(Some(
                                checksum_address.clone(),
                            )),
                            notification_settings::wallet_notification_settings_id::set(Some(
                                wallet_notification_settings.clone().id,
                            )),
                        ],
                    )
                })
                .collect(),
        );

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
    let parsed_query_address: Address = query.address.parse()?;

    // If the user id is provided, authenticate the user.
    let auth_user_id = if query.user_id.is_some() {
        authenticate_user(state, session, auth_token, query.user_id.clone()).await?
    } else {
        authenticate_wallet_user(state, session, &parsed_query_address, None, None).await?
    };

    Ok(auth_user_id)
}
