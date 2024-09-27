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

use super::types::WalletSettings;
use crate::{result::AppJsonResult, state::AppState};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{wallet, wallet_settings};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
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
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a wallet settings
///
/// Gets a wallet settings by address.
#[utoipa::path(
        get,
        path = "/wallet/settings/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Wallet settings returned successfully", body = WalletSettings),
            (status = 404, description = "Wallet settings not found", body = WalletSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_settings_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<WalletSettings> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    let parsed_query_address: Address = query.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);

    info!("Get wallet_settings for address: {:?}", checksum_address);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let wallet_settings = state
        .client
        .wallet_settings()
        .upsert(
            wallet_settings::wallet_address::equals(checksum_address.clone()),
            wallet_settings::create(wallet::address::equals(checksum_address.clone()), vec![]),
            vec![],
        )
        .exec()
        .await?;

    // ---------------------------------------------------------------------
    // Return
    // ---------------------------------------------------------------------

    let wallet_settings: WalletSettings = wallet_settings.into();

    return Ok(Json::from(wallet_settings));
}
