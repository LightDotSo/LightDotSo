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

use super::types::{WalletBilling, WalletBillingOptional};
use crate::{
    constants::KAKI_USER_ID, error::RouteError, result::AppJsonResult,
    routes::wallet_billing::error::WalletBillingError, sessions::get_user_id, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::wallet_billing;
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
    /// The hash of the wallet billing.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct WalletBillingUpdateRequestParams {
    /// The result of the wallet_billing.
    pub wallet_billing: WalletBillingOptional,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update the wallet billing
#[utoipa::path(
        put,
        path = "/wallet/billing/update",
        params(
            PutQuery
        ),
        request_body = WalletBillingUpdateRequestParams,
        responses(
            (status = 200, description = "Wallet billing updated successfully", body = WalletBilling),
            (status = 400, description = "Invalid Configuration", body = WalletBillingError),
            (status = 401, description = "Unauthorized", body = WalletBillingError),
            (status = 500, description = "Wallet billing internal error", body = WalletBillingError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_billing_update_handler(
    put_query: Query<PutQuery>,
    State(state): State<AppState>,
    mut session: Session,
    // Json(params): Json<WalletBillingUpdateRequestParams>,
) -> AppJsonResult<WalletBilling> {
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
        return Err(RouteError::WalletBillingError(WalletBillingError::Unauthorized(format!(
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

    // Get the wallet_billing from the put body.
    // let wallet_billing = params.wallet_billing;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // For each wallet_billing, create the params update.
    let params = vec![];

    // info!("Update wallet_billing for address: {:?}", checksum_address);

    // if wallet_billing.balance_usd.is_some() {
    //     let balance_usd = wallet_billing.balance_usd.unwrap();
    //     params.push(wallet_billing::balance_usd::set(balance_usd));
    // }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the wallet_billing the database.
    let wallet_billing = state
        .client
        .wallet_billing()
        .update(wallet_billing::wallet_address::equals(checksum_address.clone()), params.clone())
        .exec()
        .await?;
    info!(?wallet_billing);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let wallet_billing: WalletBilling = wallet_billing.into();

    Ok(Json::from(wallet_billing))
}
