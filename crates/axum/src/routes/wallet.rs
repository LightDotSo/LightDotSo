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
use eyre::{eyre, Result};
use lightdotso_contracts::constants::LIGHT_WALLET_FACTORY_ADDRESS;
use lightdotso_prisma::{user, user_operation, wallet};
use lightdotso_solutions::{
    builder::rooted_node_builder,
    config::WalletConfig,
    hash::get_address,
    types::{AddressSignatureLeaf, SignatureLeaf, Signer, SignerNode},
};
use lightdotso_tracing::tracing::{error, info, trace};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the wallet.
    pub address: String,
    /// The chain id of the wallet.
    pub chain_id: Option<i64>,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first wallet to return.
    pub offset: Option<i64>,
    /// The maximum number of wallets to return.
    pub limit: Option<i64>,
    /// A filter to return wallets w/ a given owner.
    pub owner: Option<String>,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// Whether to simulate the wallet creation.
    pub simulate: Option<bool>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct WalletPostRequestParams {
    /// The array of owners of the wallet.
    #[schema(example = json!([{"address": "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed", "weight": 1}]))]
    pub owners: Vec<Owner>,
    /// The salt is used to calculate the new wallet address.
    #[schema(
        example = "0x0000000000000000000000000000000000000000000000000000000000000006",
        default = "0x0000000000000000000000000000000000000000000000000000000000000001"
    )]
    pub salt: String,
    /// The name of the wallet.
    #[schema(example = "My Wallet", default = "My Wallet")]
    pub name: String,
    /// The threshold of the wallet.
    #[schema(example = 3, default = 1)]
    pub threshold: u16,
}

/// Wallet owner.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[schema(example = json!({"address": "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed", "weight": 1}))]
pub(crate) struct Owner {
    /// The address of the owner.
    address: String,
    /// The weight of the owner.
    weight: u8,
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
    /// Wallet configuration is invalid.
    /// The threshold is greater than the number of owners.
    /// The threshold is 0.
    #[schema(example = "Invalid configuration")]
    InvalidConfiguration(String),
}

/// Wallet to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Wallet {
    address: String,
    factory_address: String,
    name: String,
    salt: String,
}

/// WalletTab to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct WalletTab {
    transaction_count: i64,
    owner_count: i64,
}

// Implement From<wallet::Data> for Wallet.
impl From<wallet::Data> for Wallet {
    fn from(wallet: wallet::Data) -> Self {
        Self {
            address: wallet.address.to_string(),
            factory_address: wallet.factory_address.to_string(),
            name: wallet.name.to_string(),
            salt: wallet.salt.to_string(),
        }
    }
}

// Implement From<wallet::Data> for Wallet.
impl From<wallet::Data> for WalletTab {
    fn from(wallet: wallet::Data) -> Self {
        let transaction_count = match &wallet.user_operations {
            Some(user_operations) => user_operations.len() as i64,
            None => 0,
        };

        let owner_count = match &wallet.users {
            Some(users) => users.len() as i64,
            None => 0,
        };

        Self { transaction_count, owner_count }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/wallet/get", get(v1_wallet_get_handler))
        .route("/wallet/tab", get(v1_wallet_tab_handler))
        .route("/wallet/list", get(v1_wallet_list_handler))
        .route("/wallet/create", post(v1_wallet_post_handler))
}

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
async fn v1_wallet_get_handler(
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
        .find_unique(wallet::address::equals(checksum_address))
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet.ok_or(AppError::NotFound)?;

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    Ok(Json::from(wallet))
}

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
async fn v1_wallet_tab_handler(
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
        .unwrap()
        .wallet()
        .find_unique(wallet::address::equals(checksum_address))
        .with(wallet::users::fetch(vec![]))
        .with(wallet::user_operations::fetch(vec![user_operation::status::equals(
            lightdotso_prisma::UserOperationStatus::Proposed,
        )]))
        .exec()
        .await?;

    info!(?wallet);

    // If the wallet is not found, return a 404.
    let wallet = wallet.ok_or(AppError::NotFound)?;

    // Get the number of owners of the wallet.
    let tab: WalletTab = wallet.into();

    Ok(Json::from(tab))
}

/// Returns a list of wallets.
#[utoipa::path(
        get,
        path = "/wallet/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Wallets returned successfully", body = [Wallet]),
            (status = 500, description = "Wallet bad request", body = WalletError),
        )
    )]
#[autometrics]
async fn v1_wallet_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Wallet>> {
    // Get the pagination query.
    let Query(pagination) = pagination;

    let query = match pagination.owner {
        Some(owner) => vec![wallet::users::some(vec![user::address::equals(Some(owner))])],
        None => vec![],
    };

    // Get the wallets from the database.
    let wallets = client
        .client
        .unwrap()
        .wallet()
        .find_many(query)
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
        path = "/wallet/create",
        params(
            PostQuery
        ),
        request_body = WalletPostRequestParams,
        responses(
            (status = 200, description = "Wallet created successfully", body = Wallet),
            (status = 400, description = "Invalid Configuration", body = WalletError),
            (status = 409, description = "Wallet already exists", body = WalletError),
            (status = 500, description = "Wallet internal error", body = WalletError),
        )
    )]
#[autometrics]
async fn v1_wallet_post_handler(
    post: Query<PostQuery>,
    State(client): State<AppState>,
    Json(params): Json<WalletPostRequestParams>,
) -> AppJsonResult<Wallet> {
    // Get the post query.
    let Query(post) = post;

    let factory_address: H160 = *LIGHT_WALLET_FACTORY_ADDRESS;

    let owners = &params.owners;
    let threshold = params.threshold;
    let name = params.name;

    // Check if all of the owner address can be parsed to H160.
    let _ = owners
        .iter()
        .map(|owner| owner.address.parse::<H160>())
        .collect::<Result<Vec<H160>, _>>()?;

    // Check if the threshold is greater than 0
    if params.threshold == 0 {
        return Err(AppError::BadRequest);
    }

    // Parse the salt to bytes.
    let salt_bytes: H256 = params.salt.parse()?;

    // Conver the owners to SignerNode.
    let owner_nodes: Vec<SignerNode> = owners
        .iter()
        .map(|owner| SignerNode {
            signer: Some(Signer {
                weight: Some(owner.weight),
                leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                    address: owner.address.parse().unwrap(),
                }),
            }),
            left: None,
            right: None,
        })
        .collect();

    // Build the node tree.
    let tree = rooted_node_builder(owner_nodes)?;

    // Create a wallet config
    let mut config = WalletConfig {
        signature_type: 0,
        checkpoint: 0,
        threshold: params.threshold,
        weight: 1,
        image_hash: [0; 32].into(),
        tree,
        internal_root: None,
    };

    // Simulate the image hash of the wallet config.
    let res = config.regenerate_image_hash([0; 32]);

    // If the image hash of the wallet could not be simulated, return a 404.
    let image_hash = res.map_err(|_| AppError::NotFound)?;

    // Parse the image hash to bytes.
    let image_hash_bytes: H256 = image_hash.into();

    // Calculate the new wallet address.
    let new_wallet_address = get_address(image_hash_bytes, salt_bytes);

    // Check if the wallet configuration is valid.
    let valid = config.is_wallet_valid();

    // If the wallet configuration is invalid, return a 500.
    if !valid {
        error!("Invalid configuration");
        return Err(eyre!("Invalid configuration").into());
    }

    // If the simulate flag is set, return the wallet address.
    if post.simulate.unwrap_or(false) {
        // Check if the wallet exists.
        let wallet = client
            .client
            .unwrap()
            .wallet()
            .find_first(vec![wallet::address::equals(to_checksum(&new_wallet_address, None))])
            .exec()
            .await?;

        // If the wallet exists, return a 409.
        if wallet.is_some() {
            return Err(AppError::Conflict);
        }

        return Ok(Json::from(Wallet {
            name: "".to_string(),
            salt: format!("{:?}", salt_bytes),
            address: to_checksum(&new_wallet_address, None),
            factory_address: to_checksum(&factory_address, None),
        }));
    }

    // Get the users that don't exist in the database.
    let users = client
        .clone()
        .client
        .unwrap()
        .user()
        .find_many(
            owners
                .iter()
                .map(|owner| {
                    lightdotso_prisma::user::address::equals(Some(to_checksum(
                        &owner.address.parse::<H160>().unwrap(),
                        None,
                    )))
                })
                .collect(),
        )
        .exec()
        .await?;

    // Parse the users into a vector of addresses.
    let users: Vec<String> = users.iter().map(|user| user.address.clone().unwrap()).collect();
    info!(?users);

    // Get the owners that don't exist in the vector of addresses.
    let owners: Vec<&Owner> = owners
        .iter()
        .filter(|owner| {
            !users.contains(&to_checksum(&owner.address.parse::<H160>().unwrap(), None))
        })
        .collect();
    info!("{}", owners.len());

    // Attempt to create a user in case it does not exist.
    let res = client
        .clone()
        .client
        .unwrap()
        .user()
        .create_many(
            owners
                .iter()
                .map(|owner| {
                    lightdotso_prisma::user::create_unchecked(vec![
                        lightdotso_prisma::user::address::set(Some(to_checksum(
                            &owner.address.parse::<H160>().unwrap(),
                            None,
                        ))),
                    ])
                })
                .collect(),
        )
        .exec()
        .await?;
    info!(?res);

    let wallet: Result<lightdotso_prisma::wallet::Data> = client
        .client
        .unwrap()
        ._transaction()
        .run(|client| async move {
            // Create the configuration to the database.
            let configuration_data = client
                .configuration()
                .create(
                    to_checksum(&new_wallet_address, None),
                    0,
                    format!("{:?}", image_hash_bytes),
                    threshold.into(),
                    vec![],
                )
                .exec()
                .await?;
            trace!(?configuration_data);

            // Get the users from the database.
            let user_data = client
                .user()
                .find_many(
                    owners
                        .iter()
                        .map(|owner| {
                            lightdotso_prisma::user::address::equals(Some(to_checksum(
                                &owner.address.parse::<H160>().unwrap(),
                                None,
                            )))
                        })
                        .collect(),
                )
                .exec()
                .await?;

            // Create the owners to the database.
            let owner_data = client
                .owner()
                .create_many(
                    owners
                        .iter()
                        .map(|owner| {
                            lightdotso_prisma::owner::create_unchecked(
                                to_checksum(&owner.address.parse::<H160>().unwrap(), None),
                                owner.weight.into(),
                                configuration_data.clone().id,
                                vec![lightdotso_prisma::owner::user_id::set(Some(
                                    user_data
                                        .iter()
                                        .find(|user| {
                                            user.address ==
                                                Some(to_checksum(
                                                    &owner.address.parse::<H160>().unwrap(),
                                                    None,
                                                ))
                                        })
                                        .unwrap()
                                        .id
                                        .clone(),
                                ))],
                            )
                        })
                        .collect(),
                )
                .exec()
                .await?;
            trace!(?owner_data);

            // Get the wallet from the database.
            let wallet = client
                .wallet()
                .create(
                    to_checksum(&new_wallet_address, None),
                    format!("{:?}", salt_bytes),
                    to_checksum(&factory_address, None),
                    vec![
                        lightdotso_prisma::wallet::name::set(name),
                        lightdotso_prisma::wallet::configurations::connect(vec![
                            lightdotso_prisma::configuration::id::equals(configuration_data.id),
                        ]),
                        lightdotso_prisma::wallet::users::connect(
                            user_data
                                .iter()
                                .map(|user| lightdotso_prisma::user::id::equals(user.id.clone()))
                                .collect(),
                        ),
                    ],
                )
                .exec()
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
