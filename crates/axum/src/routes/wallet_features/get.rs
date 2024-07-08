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

use super::types::WalletFeatures;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{wallet, wallet_features};
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
    /// The address of the wallet features.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a wallet features
#[utoipa::path(
        get,
        path = "/wallet/features/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Wallet Features returned successfully", body = WalletFeatures),
            (status = 404, description = "Wallet Features not found", body = WalletFeaturesError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_features_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<WalletFeatures> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    info!("Get wallet_features for address: {:?}", checksum_address);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let wallet_features = state
        .client
        .wallet_features()
        .upsert(
            wallet_features::wallet_address::equals(checksum_address.clone()),
            wallet_features::create(wallet::address::equals(checksum_address.clone()), vec![]),
            vec![],
        )
        .exec()
        .await?;

    // ---------------------------------------------------------------------
    // Return
    // ---------------------------------------------------------------------

    let wallet_features: WalletFeatures = wallet_features.into();

    return Ok(Json::from(wallet_features));
}
