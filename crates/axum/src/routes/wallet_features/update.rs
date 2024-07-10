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

use super::types::{WalletFeatures, WalletFeaturesOptional};
use crate::{
    constants::KAKI_USER_ID, error::RouteError, result::AppJsonResult,
    routes::wallet_features::error::WalletFeaturesError, sessions::get_user_id, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{wallet, wallet_features};
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
    /// The hash of the wallet features.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct WalletFeaturesUpdateRequestParams {
    /// The result of the wallet_features.
    pub wallet_features: WalletFeaturesOptional,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update the wallet features
#[utoipa::path(
        put,
        path = "/wallet/features/update",
        params(
            PutQuery
        ),
        request_body = WalletFeaturesUpdateRequestParams,
        responses(
            (status = 200, description = "Wallet features updated successfully", body = WalletFeatures),
            (status = 400, description = "Invalid configuration", body = WalletFeaturesError),
            (status = 401, description = "Unauthorized", body = WalletFeaturesError),
            (status = 500, description = "Wallet features internal error", body = WalletFeaturesError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_features_update_handler(
    put_query: Query<PutQuery>,
    State(state): State<AppState>,
    mut session: Session,
    Json(params): Json<WalletFeaturesUpdateRequestParams>,
) -> AppJsonResult<WalletFeatures> {
    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session)?;
    info!(?auth_user_id);

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    // If the authenticated user id is not `KAKI_USER_ID`, return an error.
    if auth_user_id != KAKI_USER_ID.to_string() {
        return Err(RouteError::WalletFeaturesError(WalletFeaturesError::Unauthorized(format!(
            "Not authorized for {}",
            auth_user_id
        )))
        .into());
    }

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the put query.
    let Query(put) = put_query;

    // Parse the address from the put query.
    let parsed_query_address: H160 = put.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallet_features from the put body.
    let wallet_features = params.wallet_features;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // For each wallet_features, create the params update.
    let mut params = vec![];

    info!("Update wallet_features for address: {:?}", checksum_address);

    if wallet_features.is_enabled_ai.is_some() {
        let is_enabled_ai = wallet_features.is_enabled_ai.unwrap();
        params.push(wallet_features::is_enabled_ai::set(is_enabled_ai));
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the wallet_features the database.
    let wallet_features = state
        .client
        .wallet_features()
        .upsert(
            wallet_features::wallet_address::equals(checksum_address.clone()),
            wallet_features::create(
                wallet::address::equals(checksum_address.clone()),
                params.clone(),
            ),
            params.clone(),
        )
        .exec()
        .await?;
    info!(?wallet_features);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let wallet_features: WalletFeatures = wallet_features.into();

    Ok(Json::from(wallet_features))
}
