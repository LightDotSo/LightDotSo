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

use super::types::{WalletNotificationSettings, WalletNotificationSettingsOptional};
use crate::{
    authentication::authenticate_wallet_user,
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::wallet_notification_settings::error::WalletNotificationSettingsError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_notifier::types::WALLET_NOTIFICATION_DEFAULT_ENABLED;
use lightdotso_prisma::{
    notification_settings, user, wallet, wallet_notification_settings, ActivityEntity,
    ActivityOperation,
};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PutQuery {
    /// The hash of the wallet settings.
    pub address: String,
    /// The user id to filter by.
    pub user_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct WalletNotificationSettingsUpdateRequestParams {
    /// The result of the wallet_notification_settings.
    pub wallet_notification_settings: WalletNotificationSettingsOptional,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update the wallet notification settings
#[utoipa::path(
        put,
        path = "/wallet/notification/settings/update",
        params(
            PutQuery
        ),
        request_body = WalletNotificationSettingsUpdateRequestParams,
        responses(
            (status = 200, description = "Wallet notification settings updated successfully", body = WalletNotificationSettings),
            (status = 400, description = "Invalid Configuration", body = WalletNotificationSettingsError),
            (status = 409, description = "Wallet notification settings already exists", body = WalletNotificationSettingsError),
            (status = 500, description = "Wallet notification settings internal error", body = WalletNotificationSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_notification_settings_update_handler(
    put_query: Query<PutQuery>,
    State(state): State<AppState>,
    mut session: Session,
    Json(params): Json<WalletNotificationSettingsUpdateRequestParams>,
) -> AppJsonResult<WalletNotificationSettings> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the put query.
    let Query(put) = put_query;

    // Parse the address from the put query.
    let parsed_query_address: H160 = put.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallet_notification_settings from the put body.
    let optional_params = params.wallet_notification_settings;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Check to see if the user is one of the owners of the wallet configurations.
    let auth_user_id =
        authenticate_wallet_user(&state, &mut session, &parsed_query_address, None, put.user_id)
            .await?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the wallet_notification_settings the database.
    let wallet_notification_settings = state
        .client
        .wallet_notification_settings()
        .upsert(
            wallet_notification_settings::user_id_wallet_address(
                auth_user_id.clone(),
                checksum_address.clone(),
            ),
            wallet_notification_settings::create(
                user::id::equals(auth_user_id.clone()),
                wallet::address::equals(checksum_address.clone()),
                vec![],
            ),
            vec![],
        )
        .exec()
        .await?;
    info!(?wallet_notification_settings);

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Check to see if the keys in the params vec is one of `USER_NOTIFICATION_SETTINGS_KEYS`.
    // If it is not, return an error.
    if let Some(settings) = optional_params.clone().settings {
        for setting in settings.iter() {
            if !WALLET_NOTIFICATION_DEFAULT_ENABLED.contains_key(&setting.key) {
                return Err(AppError::RouteError(RouteError::WalletNotificationSettingsError(
                    WalletNotificationSettingsError::BadRequest(
                        "Invalid Configuration".to_string(),
                    ),
                )));
            }
        }
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // For each setting in the optional params, update the wallet_notification_settings.
    if let Some(settings) = optional_params.settings {
        for setting in settings.iter() {
            state
                .client
                .notification_settings()
                .upsert(
                    notification_settings::key_user_id_wallet_address(
                        setting.key.clone(),
                        auth_user_id.clone(),
                        checksum_address.clone(),
                    ),
                    notification_settings::create(
                        setting.key.clone(),
                        setting.value,
                        user::id::equals(auth_user_id.clone()),
                        vec![notification_settings::is_enabled::set(setting.value)],
                    ),
                    vec![notification_settings::is_enabled::set(setting.value)],
                )
                .exec()
                .await?;
        }
    }

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::WalletNotificationSettings,
        &ActivityMessage {
            operation: ActivityOperation::Update,
            log: serde_json::to_value(&wallet_notification_settings)?,
            params: CustomParams {
                user_id: Some(auth_user_id),
                wallet_address: Some(checksum_address.clone()),
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let wallet_notification_settings: WalletNotificationSettings =
        wallet_notification_settings.into();

    Ok(Json::from(wallet_notification_settings))
}
