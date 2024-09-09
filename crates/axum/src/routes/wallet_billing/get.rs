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

use super::types::WalletBilling;
use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::wallet_billing::error::WalletBillingError,
    state::AppState,
};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{billing, wallet, wallet_billing, BillingStatus};
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

/// Get a wallet billing
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

    let parsed_query_address: Address = query.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);

    info!("Get wallet_billing for address: {:?}", checksum_address);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let wallet_billing = state
        .client
        .wallet_billing()
        .find_unique(wallet_billing::wallet_address::equals(checksum_address.clone()))
        .with(wallet_billing::billing::fetch())
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

        let billing =
            state.client.billing().create(0.0, BillingStatus::User, vec![]).exec().await?;

        let wallet_billing = state
            .client
            .wallet_billing()
            .create(
                wallet::address::equals(checksum_address.clone()),
                billing::id::equals(billing.id),
                vec![],
            )
            .exec()
            .await?;

        // ---------------------------------------------------------------------
        // Return
        // ---------------------------------------------------------------------

        let wallet_billing: WalletBilling = wallet_billing.into();

        return Ok(Json::from(wallet_billing));
    }
}
