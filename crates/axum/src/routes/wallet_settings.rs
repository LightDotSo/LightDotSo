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
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::{get, post},
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::wallet_settings;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub address: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The hash of the user operation.
    pub address: String,
}

/// WalletSettings operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum WalletSettingsError {
    // WalletSettings query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// WalletSettings not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct WalletSettings {
    // The wallet_settings of whether the testnet is enabled.
    pub is_enabled_testnet: bool,
}

/// Optional Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct WalletSettingsOptional {
    // The update query of wallet_settings of whether the testnet is enabled.
    pub is_enabled_testnet: Option<bool>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct WalletSettingsPostRequestParams {
    /// The result of the wallet_settings.
    pub wallet_settings: WalletSettingsOptional,
}

// Implement From<wallet_settings::Data> for WalletSettings.
impl From<wallet_settings::Data> for WalletSettings {
    fn from(wallet_settings: wallet_settings::Data) -> Self {
        Self { is_enabled_testnet: wallet_settings.is_enabled_testnet }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/wallet_settings/get", get(v1_wallet_settings_get_handler))
        .route("/wallet_settings/create", post(v1_wallet_settings_post_handler))
}

/// Get a wallet_settings
#[utoipa::path(
        get,
        path = "/wallet_settings/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "WalletSettings returned successfully", body = WalletSettings),
            (status = 404, description = "WalletSettings not found", body = WalletSettingsError),
        )
    )]
#[autometrics]
async fn v1_wallet_settings_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<WalletSettings> {
    // Get the get query.
    let Query(query) = get;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    info!("Get wallet_settings for address: {:?}", checksum_address);

    // Get the signatures from the database.
    let wallet_settings = client
        .client
        .unwrap()
        .wallet_settings()
        .find_unique(wallet_settings::wallet_address::equals(checksum_address))
        .exec()
        .await?;

    // If the wallet_settings is not found, return a 404.
    let wallet_settings = wallet_settings.ok_or(AppError::NotFound)?;

    // Change the wallet_settings to the format that the API expects.
    let wallet_settings: WalletSettings = wallet_settings.into();

    Ok(Json::from(wallet_settings))
}

/// Create a wallet_settings
#[utoipa::path(
        post,
        path = "/wallet_settings/update",
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
async fn v1_wallet_settings_post_handler(
    post: Query<PostQuery>,
    State(client): State<AppState>,
    Json(params): Json<WalletSettingsPostRequestParams>,
) -> AppJsonResult<WalletSettings> {
    // Get the post query.
    let Query(post) = post;

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
        .unwrap()
        .wallet_settings()
        .update(wallet_settings::wallet_address::equals(checksum_address), params)
        .exec()
        .await?;
    info!(?wallet_settings);

    // Change the signatures to the format that the API expects.
    let wallet_settings: WalletSettings = wallet_settings.into();

    Ok(Json::from(wallet_settings))
}
