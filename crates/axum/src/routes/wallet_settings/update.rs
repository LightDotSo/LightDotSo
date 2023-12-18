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

#![allow(clippy::unwrap_used)]

use super::types::{WalletSettings, WalletSettingsOptional};
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{wallet, wallet_settings};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The hash of the wallet settings.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct WalletSettingsPostRequestParams {
    /// The result of the wallet_settings.
    pub wallet_settings: WalletSettingsOptional,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a wallet_settings
#[utoipa::path(
        post,
        path = "/wallet/settings/update",
        params(
            PostQuery
        ),
        request_body = WalletSettingsPostRequestParams,
        responses(
            (status = 200, description = "WalletSettings updated successfully", body = WalletSettings),
            (status = 400, description = "Invalid Configuration", body = WalletSettingsError),
            (status = 409, description = "WalletSettings already exists", body = WalletSettingsError),
            (status = 500, description = "WalletSettings internal error", body = WalletSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_settings_post_handler(
    post_query: Query<PostQuery>,
    State(client): State<AppState>,
    Json(params): Json<WalletSettingsPostRequestParams>,
) -> AppJsonResult<WalletSettings> {
    // Get the post query.
    let Query(post) = post_query;

    // Parse the address from the post query.
    let parsed_query_address: H160 = post.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallet_settings from the post body.
    let wallet_settings = params.wallet_settings;

    // For each wallet_settings, create the params update.
    let mut params = vec![];

    info!("Update wallet_settings for address: {:?}", checksum_address);

    if wallet_settings.is_enabled_testnet.is_some() {
        let is_enabled_testnet = wallet_settings.is_enabled_testnet.unwrap();
        params.push(wallet_settings::is_enabled_testnet::set(is_enabled_testnet));
    }

    // Create the wallet_settings the database.
    let wallet_settings = client
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

    // Change the signatures to the format that the API expects.
    let wallet_settings: WalletSettings = wallet_settings.into();

    Ok(Json::from(wallet_settings))
}
