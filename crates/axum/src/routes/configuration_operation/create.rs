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

// use super::types::ConfigurationOperationSignature;
use crate::{
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::{
        configuration_operation::{
            error::ConfigurationOperationError, types::ConfigurationOperation,
        },
        configuration_operation_signature::error::ConfigurationOperationSignatureError,
    },
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
use lightdotso_common::traits::{HexToBytes, VecU8ToHex};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{
    configuration, configuration_operation, configuration_operation_owner, owner, user, wallet,
    ActivityEntity, ActivityOperation,
};
use lightdotso_sequence::{
    builder::rooted_node_builder,
    config::WalletConfig,
    signature::recover_ecdsa_signature,
    types::{AddressSignatureLeaf, SignatureLeaf, Signer, SignerNode},
    utils::{hash_image_bytes32, render_subdigest},
};
use lightdotso_tracing::tracing::{error, info};
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The address of the wallet.
    pub address: String,
    /// Whether to simulate the configuration operation.
    pub simulate: Option<bool>,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

/// Signature operation post request params
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct ConfigurationOperationCreateRequestParams {
    /// The array of owners of the wallet.
    #[schema(example = json!([{"address": "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed", "weight": 1}]))]
    pub owners: Vec<ConfigurationOperationCreateOwnerParams>,
    /// The result of the signature.
    pub signature: ConfigurationOperationSignatureCreateParams,
    /// The threshold of the wallet.
    #[schema(example = 3, default = 1)]
    pub threshold: u16,
}

/// Wallet owner.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
#[schema(example = json!({"address": "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed", "weight": 1}))]
pub(crate) struct ConfigurationOperationCreateOwnerParams {
    /// The address of the owner.
    pub address: String,
    /// The weight of the owner.
    pub weight: u8,
}

/// Signature operation
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct ConfigurationOperationSignatureCreateParams {
    /// The id of the owner of the signature.
    pub owner_id: String,
    /// The signature of the user operation in hex.
    pub signature: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a configuration signature
#[utoipa::path(
        post,
        path = "/configuration_operation/create",
        params(
            PostQuery
        ),
        request_body = ConfigurationOperationCreateRequestParams,
        responses(
            (status = 200, description = "Signature created successfully", body = ConfigurationOperation),
            (status = 400, description = "Invalid configuration", body = ConfigurationOperationError),
            (status = 409, description = "Signature already exists", body = ConfigurationOperationError),
            (status = 500, description = "Signature internal error", body = ConfigurationOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<ConfigurationOperationCreateRequestParams>,
) -> AppJsonResult<ConfigurationOperation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;
    info!(?query);

    let owners = &params.owners;
    let threshold = params.threshold;

    // Get the signature from the post body.
    let sig = params.signature;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the current configuration for the wallet.
    let configuration = state
        .client
        .configuration()
        .find_first(vec![configuration::address::equals(query.address.clone())])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .with(configuration::owners::fetch(vec![]))
        .exec()
        .await?;
    info!(?configuration);

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(RouteError::ConfigurationOperationSignatureError(
        ConfigurationOperationSignatureError::NotFound("Configuration not found".to_string()),
    ))?;

    let configuration_owners =
        configuration.clone().owners.ok_or(RouteError::ConfigurationOperationError(
            ConfigurationOperationError::NotFound("Configuration owners not found".to_string()),
        ))?;

    // -------------------------------------------------------------------------
    // Validate
    // -------------------------------------------------------------------------

    // Check if the signature `owner_id` is in the configuration owners.
    configuration_owners
        .iter()
        .find(|owner| owner.id == sig.owner_id)
        .ok_or(AppError::BadRequest)?;

    // Check if all of the owner address can be parsed to H160.
    let owners_addresses = owners
        .iter()
        .map(|owner| owner.address.parse::<H160>())
        .collect::<Result<Vec<H160>, _>>()?;

    // Check if the threshold is greater than 0
    if params.threshold == 0 {
        return Err(AppError::BadRequest);
    }

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
        // The signature type is 0 since it is not computed in the encoding.
        signature_type: 0,
        checkpoint: configuration.checkpoint as u32 + 1,
        threshold,
        // Can be 1 since it is not computed in the encoding.
        weight: 1,
        // Can be 0 since it is not computed in the encoding.
        image_hash: [0; 32].into(),
        tree,
        internal_root: None,
        internal_recovered_configs: None,
    };

    // Simulate the image hash of the wallet config.
    let res = config.regenerate_image_hash([0; 32]);

    // If the image hash of the wallet could not be simulated, return a 404.
    let image_hash = res.map_err(|_| AppError::NotFound)?;
    info!("image_hash: {}", image_hash.to_vec().to_hex_string());

    // Parse the image hash to bytes.
    let image_hash_bytes: H256 = image_hash.into();

    // Check if the wallet configuration is valid.
    let valid = config.is_wallet_valid();

    // If the wallet configuration is invalid, return a 500.
    if !valid {
        error!("Invalid configuration");
        return Err(eyre!("Invalid configuration").into());
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallet from the database.
    let wallet = state
        .client
        .wallet()
        .find_unique(wallet::address::equals(query.address.clone()))
        .exec()
        .await?;

    // If the wallet is not found, return a 404.
    let wallet = wallet.clone().ok_or(RouteError::ConfigurationOperationError(
        ConfigurationOperationError::NotFound("Wallet not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // Check that the signature is valid.
    let sig_bytes = sig.signature.hex_to_bytes()?;

    // Render the subdigest.
    let subdigest = render_subdigest(
        // Chain agnostic signature type.
        0,
        wallet.clone().address.parse()?,
        hash_image_bytes32(&image_hash)?,
    )?;
    info!("subdigest: {}", subdigest.to_vec().to_hex_string());

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // If the simulate flag is set, return the wallet address.
    if query.simulate.unwrap_or(false) {
        return Ok(Json::from(ConfigurationOperation {
            id: "0".to_string(),
            image_hash: format!("{:?}", image_hash_bytes),
            checkpoint: configuration.checkpoint + 1,
            threshold: params.threshold as i64,
            status: "SIMULATED".to_string(),
        }));
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the owner from the database.
    let owner = state
        .client
        .owner()
        .find_unique(owner::id::equals(sig.clone().owner_id))
        .with(owner::user::fetch())
        .exec()
        .await?;
    info!(?owner);

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // Recover the signature.
    let recovered_sig = recover_ecdsa_signature(&sig_bytes, &subdigest, 0)?;
    info!(?recovered_sig);

    // If the owner is not found, return a 404.
    let owner = owner.ok_or(AppError::NotFound)?;

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address != owner.clone().address.parse()? {
        error!(
            "recovered_sig.address: {}, owner.address: {}",
            recovered_sig.address,
            owner.clone().address
        );
        return Err(AppError::BadRequest);
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the users from the database.
    let user_data = state
        .client
        .user()
        .find_many(vec![user::address::in_vec(
            owners_addresses.iter().map(|addr| to_checksum(addr, None)).collect(),
        )])
        .exec()
        .await?;
    info!(?user_data);

    // Create a new configuration_operation w/ the same contents as the configuration operation.
    let configuration_operation: Result<configuration_operation::Data> = state
        .client
        ._transaction()
        .run(|client| async move {
            // Create the configuration to the database.
            let configuration_operation = client
                .configuration_operation()
                .create(
                    configuration.checkpoint + 1,
                    format!("{:?}", image_hash_bytes),
                    threshold as i64,
                    wallet::address::equals(query.address.clone()),
                    vec![],
                )
                .exec()
                .await?;
            info!(?configuration_operation);

            // Create the owners to the database.
            let owner_data = client
                .configuration_operation_owner()
                .create_many(
                    owners
                        .iter()
                        .enumerate()
                        .map(|(index, config_owner)| {
                            configuration_operation_owner::create_unchecked(
                                to_checksum(&config_owner.address.parse::<H160>().unwrap(), None),
                                config_owner.weight.into(),
                                index as i32,
                                configuration_operation.clone().id,
                                vec![configuration_operation_owner::user_id::set(Some(
                                    user_data
                                        .iter()
                                        .find(|user| {
                                            user.address ==
                                                to_checksum(
                                                    &config_owner
                                                        .clone()
                                                        .address
                                                        .parse::<H160>()
                                                        .unwrap(),
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
            info!(?owner_data);

            Ok(configuration_operation)
        })
        .await;
    info!(?configuration_operation);

    // If the configuration_operation is not created, return a 500.
    let configuration_operation = configuration_operation.map_err(|_| AppError::InternalError)?;
    info!(?configuration_operation);

    // Create the signature the database.
    let configuration_operation_signature = state
        .client
        .configuration_operation_signature()
        .create(
            sig.signature.hex_to_bytes()?,
            configuration_operation::id::equals(configuration_operation.id.clone()),
            owner::id::equals(owner.id.clone()),
            vec![],
        )
        .exec()
        .await?;
    info!(?configuration_operation_signature);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::ConfigurationOperation,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&configuration_operation)?,
            params: CustomParams {
                configuration_operation_id: Some(configuration_operation.id.clone()),
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await;

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::ConfigurationOperationSignature,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&configuration_operation_signature)?,
            params: CustomParams {
                configuration_operation_signature_id: Some(
                    configuration_operation_signature.id.clone(),
                ),
                configuration_operation_id: Some(configuration_operation.id.clone()),
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let configuration_operation: ConfigurationOperation = configuration_operation.into();

    Ok(Json::from(configuration_operation))
}
