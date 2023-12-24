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

use super::types::Wallet;
use crate::{
    cookies::CookieUtility, error::RouteError, result::AppJsonResult,
    routes::wallet::error::WalletError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::wallet;
use serde::Deserialize;
use tower_cookies::Cookies;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the wallet.
    pub address: String,
    /// The chain id of the wallet.
    pub chain_id: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a wallet
#[utoipa::path(
        get,
        path = "/wallet/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Wallet returned successfully", body = Wallet),
            (status = 404, description = "Wallet not found", body = WalletError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
    cookies: Cookies,
) -> AppJsonResult<Wallet> {
    // Get the get query.
    let Query(query) = get_query;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallets from the database.
    let wallet =
        state.client.wallet().find_unique(wallet::address::equals(checksum_address)).exec().await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet
        .ok_or(RouteError::WalletError(WalletError::NotFound("Wallet not found".to_string())))?;

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    // Add the wallet cookie.
    cookies.add_wallet_cookie(wallet.address.clone()).await;

    Ok(Json::from(wallet))
}
