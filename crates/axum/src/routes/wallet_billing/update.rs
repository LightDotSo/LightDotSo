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

use super::types::{WalletBilling, WalletBillingOptional};
use crate::{
    constants::KAKI_USER_ID, error::RouteError, result::AppJsonResult,
    routes::wallet_billing::error::WalletBillingError, sessions::get_user_id, state::AppState,
};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
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
            (status = 400, description = "Invalid configuration", body = WalletBillingError),
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
    let auth_user_id = get_user_id(&mut session).await?;
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
    let parsed_query_address: Address = put.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);

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
