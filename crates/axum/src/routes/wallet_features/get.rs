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

use super::types::WalletFeatures;
use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::wallet_features::error::WalletFeaturesError,
    state::AppState,
};
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

/// Get a wallet_features
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
        .find_unique(wallet_features::wallet_address::equals(checksum_address.clone()))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // If the wallet_features is not found, create a default wallet_features in the db, if the
    // wallet exists.
    if let Some(wallet_features) = wallet_features {
        let wallet_features: WalletFeatures = wallet_features.into();

        Ok(Json::from(wallet_features))
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
            return Err(AppError::RouteError(RouteError::WalletFeaturesError(
                WalletFeaturesError::NotFound("Wallet not found".to_string()),
            )));
        }

        let wallet_features = state
            .client
            .wallet_features()
            .create(wallet::address::equals(checksum_address.clone()), vec![])
            .exec()
            .await?;

        // ---------------------------------------------------------------------
        // Return
        // ---------------------------------------------------------------------

        let wallet_features: WalletFeatures = wallet_features.into();

        return Ok(Json::from(wallet_features));
    }
}
