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

use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::wallet;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub address: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PaginationQuery {
    pub offset: Option<i64>,
    pub limit: Option<i64>,
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Wallet {
    id: String,
    address: String,
    factory_address: String,
}

// Implement From<wallet::Data> for Wallet.
impl From<wallet::Data> for Wallet {
    fn from(wallet: wallet::Data) -> Self {
        Self {
            id: wallet.id.to_string(),
            address: wallet.address.to_string(),
            factory_address: wallet.factory_address.to_string(),
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/wallet/get", get(v1_get_handler))
        .route("/wallet/list", get(v1_list_handler))
}

/// Get a wallet
#[utoipa::path(
        get,
        path = "/v1/wallet/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Wallet returned successfully", body = Wallet),
        )
    )]
#[autometrics]
async fn v1_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Wallet> {
    // Get the get query.
    let Query(query) = get;

    let parsed_query_address: H160 = query.address.parse().unwrap();
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallets from the database.
    let wallet = client
        .client
        .unwrap()
        .wallet()
        .find_first(vec![wallet::address::equals(checksum_address)])
        .exec()
        .await;

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.unwrap().unwrap().into();

    Ok(Json::from(wallet))
}

/// Returns a list of wallets.
#[utoipa::path(
        get,
        path = "/v1/wallet/list",
        params(
            PaginationQuery
        ),
        responses(
            (status = 200, description = "Wallets returned successfully", body = [Wallet]),
        )
    )]
#[autometrics]
async fn v1_list_handler(
    pagination: Option<Query<PaginationQuery>>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Wallet>> {
    // Get the pagination query.
    let Query(pagination) = pagination.unwrap_or_default();

    // Get the wallets from the database.
    let wallets = client
        .client
        .unwrap()
        .wallet()
        .find_many(vec![])
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the wallets to the format that the API expects.
    let wallets: Vec<Wallet> = wallets.into_iter().map(Wallet::from).collect();

    Ok(Json::from(wallets))
}
