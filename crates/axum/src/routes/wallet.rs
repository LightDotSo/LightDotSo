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
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::{get, post},
    Json, Router,
};
use ethers_main::{
    types::{H160, H256},
    utils::to_checksum,
};
use eyre::Result;
use lightdotso_contracts::constants::LIGHT_WALLET_FACTORY_ADDRESS;
use lightdotso_prisma::wallet;
use lightdotso_solutions::{config::WalletConfig, hash::get_address, types::SignerNode};
use lightdotso_tracing::{
    tracing::{info, info_span, trace},
    tracing_futures::Instrument,
};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    // The address of the wallet.
    pub address: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first wallet to return.
    pub offset: Option<i64>,
    // The maximum number of wallets to return.
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // TODO: Support all wallet types and config
    // The address of the single owner of the wallet.
    pub address: String,
    // The salt is used to calculate the new wallet address.
    pub salt: String,
}

/// Wallet operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum WalletError {
    // Wallet query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Wallet already exists conflict.
    #[schema(example = "Wallet already exists")]
    Conflict(String),
    /// Wallet not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
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
        .route("/wallet/create", post(v1_post_handler))
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
            (status = 404, description = "Wallet not found", body = WalletError),
        )
    )]
#[autometrics]
async fn v1_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Wallet> {
    // Get the get query.
    let Query(query) = get;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the wallets from the database.
    let wallet = client
        .client
        .unwrap()
        .wallet()
        .find_first(vec![wallet::address::equals(checksum_address)])
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet.ok_or(AppError::NotFound)?;

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    Ok(Json::from(wallet))
}

/// Returns a list of wallets.
#[utoipa::path(
        get,
        path = "/v1/wallet/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Wallets returned successfully", body = [Wallet]),
            (status = 500, description = "Wallet bad request", body = WalletError),
        )
    )]
#[autometrics]
async fn v1_list_handler(
    pagination: Option<Query<ListQuery>>,
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

/// Create a wallet
#[utoipa::path(
        post,
        path = "/v1/wallet/create",
        params(
            PostQuery
        ),
        responses(
            (status = 200, description = "Wallet created successfully", body = Wallet),
            (status = 500, description = "Wallet internal error", body = WalletError),
        )
    )]
#[autometrics]
async fn v1_post_handler(
    post: Query<PostQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Wallet> {
    // Get the post query.
    let Query(query) = post;

    let address: H160 = query.address.parse()?;
    info!(?address);
    let factory_address: H160 = *LIGHT_WALLET_FACTORY_ADDRESS;
    let checksum_factory_address = to_checksum(&factory_address, None);

    let config = WalletConfig {
        checkpoint: 1,
        threshold: 1,
        weight: 1,
        image_hash: [0; 32].into(),
        tree: SignerNode { signer: None, left: None, right: None },
        internal_root: None,
    };

    // Simulate the image hash of the wallet config.
    let res = config.image_hash_of_wallet_config();

    // If the image hash of the wallet could not be simulated, return a 404.
    let image_hash = res.map_err(|_| AppError::NotFound)?;

    // Parse the image hash to bytes.
    let image_hash_bytes: H256 = image_hash.into();

    // Parse the salt to bytes.
    let salt_bytes: H256 = query.salt.parse()?;

    // Calculate the new wallet address.
    let new_wallet_address = get_address(image_hash_bytes, salt_bytes);

    // Attempt to create a user in case it does not exist.
    let res = client
        .clone()
        .client
        .unwrap()
        .user()
        .create(vec![lightdotso_prisma::user::address::set(Some(to_checksum(&address, None)))])
        .exec()
        .await;
    info!(?res);

    let wallet: Result<lightdotso_prisma::wallet::Data> = client
        .client
        .unwrap()
        ._transaction()
        .run(|client| async move {
            // Create the configurations to the database.
            let configuration_data = client
                .configuration()
                .create(
                    to_checksum(&new_wallet_address, None),
                    format!("{:?}", image_hash_bytes),
                    1,
                    query.salt.clone(),
                    vec![],
                )
                .exec()
                .await?;
            trace!(?configuration_data);

            // Create the owners to the database.
            let owner_data = client
                .owner()
                .create(
                    to_checksum(&address, None),
                    1,
                    format!("{:?}", image_hash_bytes),
                    vec![lightdotso_prisma::owner::configuration_id::set(Some(
                        configuration_data.id,
                    ))],
                )
                .exec()
                .await?;
            trace!(?owner_data);

            // Get the wallets from the database.
            let wallet = client
                .wallet()
                .create(to_checksum(&new_wallet_address, None), 0, checksum_factory_address, vec![])
                .exec()
                .instrument(info_span!("create_receipt"))
                .await?;

            Ok(wallet)
        })
        .await;
    info!(?wallet);

    // If the wallet is not created, return a 500.
    let wallet = wallet.map_err(|_| AppError::InternalError)?;
    info!(?wallet);

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    Ok(Json::from(wallet))
}
