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

use super::types::Owner;
use crate::{
    result::{AppError, AppJsonResult},
    routes::wallet::types::Wallet,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{
    types::{H160, H256},
    utils::to_checksum,
};
use eyre::{eyre, Result};
use lightdotso_contracts::constants::LIGHT_WALLET_FACTORY_ADDRESS;
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{wallet, ActivityEntity, ActivityOperation, InviteCodeStatus};
use lightdotso_solutions::{
    builder::rooted_node_builder,
    config::WalletConfig,
    hash::get_address,
    types::{AddressSignatureLeaf, SignatureLeaf, Signer, SignerNode},
};
use lightdotso_tracing::tracing::{error, info, trace};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// Whether to simulate the wallet creation.
    pub simulate: Option<bool>,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
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
    /// The invite code of the wallet.
    #[schema(example = "BFD-23S")]
    pub invite_code: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

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
pub(crate) async fn v1_wallet_post_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<WalletPostRequestParams>,
) -> AppJsonResult<Wallet> {
    // Get the post query.
    let Query(query) = post_query;

    let factory_address: H160 = *LIGHT_WALLET_FACTORY_ADDRESS;

    let owners = &params.owners;
    let threshold = params.threshold;
    let name = params.name;

    // Check if all of the owner address can be parsed to H160.
    let owners_addresses = owners
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
    let new_wallet_address = get_address(image_hash_bytes, salt_bytes)?;

    // Check if the wallet configuration is valid.
    let valid = config.is_wallet_valid();

    // If the wallet configuration is invalid, return a 500.
    if !valid {
        error!("Invalid configuration");
        return Err(eyre!("Invalid configuration").into());
    }

    // If the simulate flag is set, return the wallet address.
    if query.simulate.unwrap_or(false) {
        // Check if the wallet exists.
        let wallet = state
            .client
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

    // If the simulate flag is not set, check if the invite code is valid.
    let invite_code = params.invite_code;

    // Check if the invite code is valid.
    let invite_code_data = state
        .client
        .invite_code()
        .find_first(vec![lightdotso_prisma::invite_code::code::equals(invite_code.clone())])
        .exec()
        .await?;

    // IF the status of the invite code is not ACTIVE, return a 400.
    if invite_code_data
        .as_ref()
        .map(|invite_code| invite_code.status != InviteCodeStatus::Active)
        .unwrap_or(true)
    {
        return Err(AppError::BadRequest);
    }

    // Attempt to create a user in case it does not exist.
    // If the user already exists, it will be skipped.
    let res = state
        .client
        .user()
        .create_many(
            owners
                .iter()
                .map(|owner| {
                    lightdotso_prisma::user::create_unchecked(
                        to_checksum(&owner.address.parse::<H160>().unwrap(), None),
                        vec![],
                    )
                })
                .collect(),
        )
        .skip_duplicates()
        .exec()
        .await?;
    info!(?res);

    let wallet: Result<lightdotso_prisma::wallet::Data> = state
        .client
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
                .find_many(vec![lightdotso_prisma::user::address::in_vec(
                    owners_addresses.iter().map(|addr| to_checksum(addr, None)).collect(),
                )])
                .exec()
                .await?;
            info!(?user_data);

            // Create the owners to the database.
            let owner_data = client
                .owner()
                .create_many(
                    owners
                        .iter()
                        .enumerate()
                        .map(|(index, owner)| {
                            lightdotso_prisma::owner::create_unchecked(
                                to_checksum(&owner.address.parse::<H160>().unwrap(), None),
                                owner.weight.into(),
                                index as i32,
                                configuration_data.clone().id,
                                vec![lightdotso_prisma::owner::user_id::set(Some(
                                    user_data
                                        .iter()
                                        .find(|user| {
                                            user.address
                                                == to_checksum(
                                                    &owner.address.parse::<H160>().unwrap(),
                                                    None,
                                                )
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

    // Produce an activity message.
    produce_activity_message(
        state.producer.clone(),
        ActivityEntity::Wallet,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&wallet)?,
            params: CustomParams {
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await?;

    // Change the wallet to the format that the API expects.
    let wallet: Wallet = wallet.into();

    // Invalidate the invite code.
    let invite_code = state
        .client
        .invite_code()
        .update(
            lightdotso_prisma::invite_code::code::equals(invite_code),
            vec![lightdotso_prisma::invite_code::status::set(InviteCodeStatus::Used)],
        )
        .exec()
        .await?;
    info!(?invite_code);

    // Produce an activity message.
    produce_activity_message(
        state.producer.clone(),
        ActivityEntity::InviteCode,
        &ActivityMessage {
            operation: ActivityOperation::Update,
            log: serde_json::to_value(&invite_code)?,
            params: CustomParams {
                wallet_address: Some(wallet.address.clone()),
                invite_code_id: Some(invite_code.id.clone()),
                ..Default::default()
            },
        },
    )
    .await?;

    Ok(Json::from(wallet))
}
