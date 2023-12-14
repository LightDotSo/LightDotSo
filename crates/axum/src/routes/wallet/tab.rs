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
    error::RouteError, result::AppJsonResult, routes::wallet::error::WalletError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::{transaction, user_operation, wallet};

use lightdotso_tracing::tracing::info;
use prisma_client_rust::or;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the wallet.
    pub address: String,
    /// The chain id of the wallet.
    pub chain_id: Option<i64>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// WalletTab to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct WalletTab {
    /// The pending number of user_operations of the wallet.
    user_operation_count: i64,
    /// The number of owners of the wallet.
    owner_count: i64,
    /// The number of transactions of the wallet.
    transaction_count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a wallet tab
#[utoipa::path(
        get,
        path = "/wallet/tab",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Wallet tab returned successfully", body = WalletTab),
            (status = 404, description = "Wallet tab not found", body = WalletError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_tab_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<WalletTab> {
    // Get the get query.
    let Query(query) = get;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    info!(?checksum_address);

    // Get the wallets from the database.
    let wallet = client
        .client
        .wallet()
        .find_unique(wallet::address::equals(checksum_address.clone()))
        .with(wallet::users::fetch(vec![]))
        .with(wallet::user_operations::fetch(vec![user_operation::status::equals(
            lightdotso_prisma::UserOperationStatus::Proposed,
        )]))
        .exec()
        .await?;
    info!(?wallet);

    // Get the transactions from the database.
    let wallet_transactions = client
        .client
        .transaction()
        .find_many(vec![or![
            transaction::wallet_address::equals(Some(checksum_address.clone())),
            transaction::from::equals(checksum_address.clone()),
            transaction::to::equals(Some(checksum_address.clone()))
        ]])
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet
        .ok_or(RouteError::WalletError(WalletError::NotFound("Wallet not found".to_string())))?;

    // Get the number of user_operation_counts of the wallet.
    let user_operation_count = match &wallet.user_operations {
        Some(user_operations) => user_operations.len() as i64,
        None => 0,
    };

    // Get the number of owners of the wallet.
    let owner_count = match &wallet.users {
        Some(users) => users.len() as i64,
        None => 0,
    };

    // Get the number of transactions of the wallet.
    let transaction_count = wallet_transactions.len() as i64;

    // Construct the wallet tab.
    let tab: WalletTab = WalletTab { transaction_count, owner_count, user_operation_count };

    Ok(Json::from(tab))
}
