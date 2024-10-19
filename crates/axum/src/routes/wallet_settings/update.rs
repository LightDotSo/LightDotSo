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
use super::{
    error::WalletSettingsError,
    types::{WalletSettings, WalletSettingsOptional},
};
use crate::{authentication::authenticate_wallet_user, result::AppJsonResult};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{wallet, wallet_settings, ActivityEntity, ActivityOperation};
use lightdotso_state::ClientState;
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
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct WalletSettingsUpdateRequestParams {
    /// The result of the wallet_settings.
    pub wallet_settings: WalletSettingsOptional,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update the wallet settings
///
/// Updates the wallet settings for a given wallet address.
#[utoipa::path(
        put,
        path = "/wallet/settings/update",
        params(
            PutQuery
        ),
        request_body = WalletSettingsUpdateRequestParams,
        responses(
            (status = 200, description = "Wallet settings updated successfully", body = WalletSettings),
            (status = 400, description = "Invalid configuration", body = WalletSettingsError),
            (status = 409, description = "Wallet settings already exists", body = WalletSettingsError),
            (status = 500, description = "Wallet settings internal error", body = WalletSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_settings_update_handler(
    put_query: Query<PutQuery>,
    State(state): State<ClientState>,
    mut session: Session,
    Json(params): Json<WalletSettingsUpdateRequestParams>,
) -> AppJsonResult<WalletSettings> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the put query.
    let Query(put) = put_query;

    // Parse the address from the put query.
    let parsed_query_address: Address = put.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);

    // Get the wallet_settings from the put body.
    let wallet_settings = params.wallet_settings;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Check to see if the user is one of the owners of the wallet configurations.
    let auth_user_id =
        authenticate_wallet_user(&state, &mut session, &parsed_query_address, None, None).await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // For each wallet_settings, create the params update.
    let mut params = vec![];

    info!("Update wallet_settings for address: {:?}", checksum_address);

    if wallet_settings.is_enabled_dev.is_some() {
        let is_enabled_dev = wallet_settings.is_enabled_dev.unwrap();
        params.push(wallet_settings::is_enabled_dev::set(is_enabled_dev));
    }

    if wallet_settings.is_enabled_testnet.is_some() {
        let is_enabled_testnet = wallet_settings.is_enabled_testnet.unwrap();
        params.push(wallet_settings::is_enabled_testnet::set(is_enabled_testnet));
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the wallet_settings the database.
    let wallet_settings = state
        .client
        .wallet_settings()
        .upsert(
            wallet_settings::wallet_address::equals(checksum_address.clone()),
            wallet_settings::create(
                wallet::address::equals(checksum_address.clone()),
                params.clone(),
            ),
            params.clone(),
        )
        .exec()
        .await?;
    info!(?wallet_settings);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::WalletSettings,
        &ActivityMessage {
            operation: ActivityOperation::Update,
            log: serde_json::to_value(&wallet_settings)?,
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
    let wallet_settings: WalletSettings = wallet_settings.into();

    Ok(Json::from(wallet_settings))
}
