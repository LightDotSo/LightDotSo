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

use super::types::WalletBilling;
use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::wallet_billing::error::WalletBillingError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{wallet, wallet_billing};
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
    /// The address of the wallet billing.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a wallet_billing
#[utoipa::path(
        get,
        path = "/wallet/billing/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Wallet billing returned successfully", body = WalletBilling),
            (status = 404, description = "Wallet billing not found", body = WalletBillingError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_billing_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<WalletBilling> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    info!("Get wallet_billing for address: {:?}", checksum_address);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let wallet_billing = state
        .client
        .wallet_billing()
        .find_unique(wallet_billing::wallet_address::equals(checksum_address.clone()))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // If the wallet_billing is not found, create a default wallet_billing in the db, if the
    // wallet exists.
    if let Some(wallet_billing) = wallet_billing {
        let wallet_billing: WalletBilling = wallet_billing.into();

        Ok(Json::from(wallet_billing))
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
            return Err(AppError::RouteError(RouteError::WalletBillingError(
                WalletBillingError::NotFound("Wallet not found".to_string()),
            )));
        }

        let wallet_billing = state
            .client
            .wallet_billing()
            .create(0.0, wallet::address::equals(checksum_address.clone()), vec![])
            .exec()
            .await?;

        // ---------------------------------------------------------------------
        // Return
        // ---------------------------------------------------------------------

        let wallet_billing: WalletBilling = wallet_billing.into();

        return Ok(Json::from(wallet_billing));
    }
}
