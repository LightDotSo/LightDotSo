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

use super::types::UserOperation;
use crate::{
    result::{AppError, AppJsonResult},
    routes::signature::create::SignatureCreateParams,
    state::AppState,
};
use alloy::{
    hex::{self, ToHexExt},
    primitives::{Address, FixedBytes, B256, U256},
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use eyre::{Report, Result};
use lightdotso_common::{traits::HexToBytes, utils::hex_to_bytes};
use lightdotso_contracts::{
    merkle_tree::MerkleTree, paymaster::decode_paymaster_and_data,
    types::UserOperation as BaseUserOperation,
};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::{activity::produce_activity_message, node::produce_node_message},
    types::{activity::ActivityMessage, node::NodeMessage},
};
use lightdotso_prisma::{
    chain, configuration, owner, paymaster, paymaster_operation, user_operation,
    user_operation_merkle, wallet, ActivityEntity, ActivityOperation, SignatureProcedure,
};
use lightdotso_sequence::{signature::recover_ecdsa_signature, utils::render_subdigest};
use lightdotso_tracing::tracing::{error, info};
use lightdotso_utils::is_testnet;
use prisma_client_rust::{chrono::DateTime, Direction};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The chain id to create the user operation for.
    pub chain_id: i64,
    // The optional flag to whether to directly send the user operation to node.
    pub is_direct_send: Option<bool>,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct UserOperationCreateRequestParams {
    // The user operation to create.
    pub user_operation: UserOperationCreateParams,
    // The signature of the user operation.
    pub signature: SignatureCreateParams,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct UserOperationCreateBatchRequestParams {
    // The user operations to create.
    pub user_operations: Vec<UserOperationCreateParams>,
    // The signature of the user operation.
    pub signature: SignatureCreateParams,
    // The merkle root of the user operations.
    pub merkle_root: String,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Item to create.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationCreateParams {
    chain_id: i64,
    hash: String,
    sender: String,
    nonce: i64,
    init_code: String,
    call_data: String,
    call_gas_limit: i64,
    verification_gas_limit: i64,
    pre_verification_gas: i64,
    max_fee_per_gas: i64,
    max_priority_fee_per_gas: i64,
    paymaster_and_data: String,
}

impl TryFrom<UserOperationCreateParams> for BaseUserOperation {
    type Error = Report;

    fn try_from(op: UserOperationCreateParams) -> Result<Self> {
        Ok(BaseUserOperation {
            sender: op.sender.parse()?,
            nonce: U256::from(op.nonce),
            init_code: hex_to_bytes(&op.init_code)?.into(),
            call_data: hex_to_bytes(&op.call_data)?.into(),
            call_gas_limit: U256::from(op.call_gas_limit),
            verification_gas_limit: U256::from(op.verification_gas_limit),
            pre_verification_gas: U256::from(op.pre_verification_gas),
            max_fee_per_gas: U256::from(op.max_fee_per_gas),
            max_priority_fee_per_gas: U256::from(op.max_priority_fee_per_gas),
            paymaster_and_data: hex_to_bytes(&op.paymaster_and_data)?.into(),
            signature: vec![].into(),
        })
    }
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a user operation
///
/// Creates a user operation with the given parameters.
#[utoipa::path(
        post,
        path = "/user_operation/create",
        params(
            PostQuery
        ),
        request_body = UserOperationCreateRequestParams,
        responses(
            (status = 200, description = "User operation created successfully", body = UserOperation),
            (status = 400, description = "Invalid configuration", body = UserOperationError),
            (status = 409, description = "User operation already exists", body = UserOperationError),
            (status = 500, description = "User operation internal error", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_create_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<UserOperationCreateRequestParams>,
) -> AppJsonResult<UserOperation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;
    info!(?query);

    // Get the chain id from the post query.
    let chain_id = query.chain_id;

    // Get the flag to directly send the user operation to the node.
    let is_direct_send = query.is_direct_send.unwrap_or(true);

    let user_operation = params.user_operation.clone();
    let user_operation_hash = params.user_operation.clone().hash;
    let sig = params.signature;

    let base_user_operation = BaseUserOperation::try_from(user_operation.clone())?;
    let base_hash = B256::from_str(&user_operation_hash)?;
    let entrypoint = base_user_operation.try_valid_op_hash(chain_id as u64, base_hash)?;
    info!(?entrypoint);

    // Assert that the hex hash of base_hash is the same as the user_operation_hash (prefix 0x)
    if (format!("0x{}", hex::encode(base_hash)) != user_operation_hash) {
        error!(
            "base_hash: {}, user_operation_hash: {}",
            hex::encode(base_hash),
            user_operation_hash
        );
        return Err(AppError::BadRequest);
    }
    info!("base_hash: 0x{}", hex::encode(base_hash));

    // Parse the user operation address.
    let sender_address: Address = user_operation.sender.parse()?;

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // Check that the signature is valid.
    let sig_bytes = sig.signature.hex_to_bytes()?;
    let digest_chain_id = match sig.signature_type {
        // Legacy
        0 => chain_id,
        // Dynamic
        1 => chain_id,
        // No chainId
        2 => 0,
        // Chained
        // Can't be used for creating user operations
        // 3 => 0,
        _ => return Err(AppError::BadRequest),
    };
    let subdigest = render_subdigest(
        digest_chain_id as u64,
        sender_address,
        user_operation_hash.hex_to_bytes32()?,
    )?;
    info!(?subdigest);

    let recovered_sig = recover_ecdsa_signature(&sig_bytes, &subdigest, 0)?;
    info!(?recovered_sig);

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

    // If the owner is not found, return a 404.
    let owner = owner.ok_or(AppError::NotFound)?;

    // Get the user id from the owner.
    let user_id = match owner.user_id {
        Some(id) => id,
        None => return Err(AppError::NotFound),
    };

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address.to_checksum(None) !=
        owner.address.parse::<Address>()?.to_checksum(None)
    {
        error!(
            "recovered_sig.address: {}, owner.address: {}",
            recovered_sig.address.to_checksum(None),
            owner.address.parse::<Address>()?.to_checksum(None)
        );
        return Err(AppError::BadRequest);
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallet from the database.
    let wallet = state
        .client
        .wallet()
        .find_unique(wallet::address::equals(user_operation.clone().sender))
        .exec()
        .await?;
    info!(?wallet);

    // If the wallet is not found, return a 404.
    let wallet = wallet.ok_or(AppError::NotFound)?;

    // If the wallet address is not equal to user operation sender, return a 400.
    if wallet.address != user_operation.sender {
        error!(
            "user_operation.sender: {}, wallet.address: {}",
            user_operation.sender, wallet.address
        );
        return Err(AppError::BadRequest);
    }

    // Get the current configuration for the wallet.
    let configuration = state
        .client
        .configuration()
        .find_first(vec![configuration::address::equals(user_operation.clone().sender)])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .with(configuration::owners::fetch(vec![]))
        .exec()
        .await?;
    info!(?configuration);

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(AppError::NotFound)?;

    // If the owners are not found, return a 404.
    let owners = configuration.owners.ok_or(AppError::NotFound)?;
    info!(?owners);

    // Check that the signature sender is one of the owners.
    if !owners.iter().any(|owner| owner.id == sig.owner_id) {
        error!("owners not found sig.owner_id: {}, owners: {:?}", sig.owner_id, owners);
        return Err(AppError::BadRequest);
    }

    // The optional params to connect paymaster to user_operation.
    let mut params = vec![user_operation::is_testnet::set(is_testnet(chain_id as u64))];

    // Parse the paymaster_and_data for the paymaster data if the paymaster is provided.
    if user_operation.paymaster_and_data.len() > 2 {
        let paymaster_data = user_operation.paymaster_and_data.hex_to_bytes()?;

        // If the paymaster data is valid, create the paymaster in the database.
        if let Ok((decded_paymaster_address, valid_until, valid_after, _msg)) =
            decode_paymaster_and_data(paymaster_data)
        {
            let paymaster = state
                .client
                .paymaster()
                .upsert(
                    paymaster::address_chain_id(
                        decded_paymaster_address.to_checksum(None),
                        chain_id,
                    ),
                    paymaster::create(
                        decded_paymaster_address.to_checksum(None),
                        chain::id::equals(chain_id),
                        vec![],
                    ),
                    vec![],
                )
                .exec()
                .await?;
            info!(?paymaster);

            // Add the paymaster to the params.
            params.push(user_operation::paymaster::connect(paymaster::id::equals(
                paymaster.clone().id,
            )));

            // This could potentially not found (not our paymaster), so we should handle it.
            let paymaster_operation = state
                .client
                .paymaster_operation()
                .find_unique(paymaster_operation::valid_until_valid_after_paymaster_id(
                    DateTime::from_timestamp(valid_until as i64, 0).unwrap().into(),
                    DateTime::from_timestamp(valid_after as i64, 0).unwrap().into(),
                    paymaster.clone().id.clone(),
                ))
                .exec()
                .await;
            info!(?paymaster_operation);

            // Add the paymaster operation to the params.
            if let Ok(Some(op)) = paymaster_operation {
                params.push(user_operation::paymaster_operation::connect(
                    paymaster_operation::id::equals(op.id),
                ));
            }
        }
    }

    // Create the user operation in the database w/ the sig.
    let res: Result<(lightdotso_prisma::signature::Data, lightdotso_prisma::user_operation::Data)> =
        state
            .client
            ._transaction()
            .run(|client| async move {
                let user_operation = client
                    .user_operation()
                    .create(
                        entrypoint.to_checksum(None),
                        user_operation.hash,
                        user_operation.nonce,
                        user_operation.init_code.hex_to_bytes()?,
                        user_operation.call_data.hex_to_bytes()?,
                        user_operation.call_gas_limit,
                        user_operation.verification_gas_limit,
                        user_operation.pre_verification_gas,
                        user_operation.max_fee_per_gas,
                        user_operation.max_priority_fee_per_gas,
                        user_operation.paymaster_and_data.hex_to_bytes()?,
                        chain::id::equals(chain_id),
                        wallet::address::equals(user_operation.sender),
                        params,
                    )
                    .exec()
                    .await?;
                info!(?user_operation);

                let signature = client
                    .signature()
                    .create(
                        sig.signature.hex_to_bytes()?,
                        sig.signature_type,
                        SignatureProcedure::OnChain,
                        owner::id::equals(sig.owner_id),
                        user_operation::hash::equals(user_operation_hash),
                        vec![],
                    )
                    .exec()
                    .await?;
                info!(?signature);

                Ok((signature, user_operation))
            })
            .await;

    // If the res contains error, log it
    if let Err(e) = &res {
        error!(?e);
    }

    // If the user_operation is not created, return a 500.
    let (signature, user_operation) = res.map_err(|_| AppError::InternalError)?;
    info!(?user_operation);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Send the user operation to the node if the flag is set.
    if is_direct_send {
        // If the owner's signature's culmative weight is greater than the threshold, queue
        // the user operation to the node.
        if owner.weight >= configuration.threshold {
            // Send the user operation to the node.
            let _ = produce_node_message(state.producer.clone(), &NodeMessage { hash: base_hash })
                .await;
        }
    }

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::Signature,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&user_operation)?,
            params: CustomParams {
                signature_id: Some(signature.id.clone()),
                user_id: Some(user_id.clone()),
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await;

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::UserOperation,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&user_operation)?,
            params: CustomParams {
                user_operation_hash: Some(user_operation.hash.clone()),
                user_id: Some(user_id.clone()),
                wallet_address: Some(wallet.address.clone()),
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a user operation
///
/// Creates a user operation with the given parameters.
#[utoipa::path(
        post,
        path = "/user_operation/create/batch",
        params(
            PostQuery
        ),
        request_body = UserOperationCreateBatchRequestParams,
        responses(
            (status = 200, description = "User operation created successfully", body = [UserOperation]),
            (status = 400, description = "Invalid configuration", body = UserOperationError),
            (status = 409, description = "User operation already exists", body = UserOperationError),
            (status = 500, description = "User operation internal error", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_create_batch_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<UserOperationCreateBatchRequestParams>,
) -> AppJsonResult<Vec<UserOperation>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = post_query;
    info!(?query);

    // Get the flag to directly send the user operation to the node.
    let is_direct_send = query.is_direct_send.unwrap_or(true);

    let user_operations = params.user_operations.clone();
    // let user_operation_hash = params.user_operation.clone().hash;
    let sig = params.signature;

    // If the signature type is not 2, return a 400.
    if sig.signature_type != 2 {
        error!("sig.signature_type: {}", sig.signature_type);
        return Err(AppError::BadRequest);
    }

    // Iterate through the user operations and check if they are valid.
    for user_operation in user_operations.clone().into_iter() {
        let chain_id = user_operation.chain_id;
        let user_operation_hash = user_operation.clone().hash;

        let base_user_operation = BaseUserOperation::try_from(user_operation.clone())?;
        let base_hash = B256::from_str(&user_operation_hash)?;
        let entrypoint = base_user_operation.try_valid_op_hash(chain_id as u64, base_hash)?;
        info!(?entrypoint);

        // Assert that the hex hash of base_hash is the same as the user_operation_hash
        if (format!("0x{}", hex::encode(base_hash)) != user_operation_hash) {
            error!(
                "base_hash: {}, user_operation_hash: {}",
                hex::encode(base_hash),
                user_operation_hash
            );
            return Err(AppError::BadRequest);
        }
        info!("base_hash: 0x{}", hex::encode(base_hash));

        // Check that the user operation address is parsable.
        let _: Address = user_operation.sender.parse()?;
    }

    // Check if all of the sender addresses are the same.
    for user_operation in user_operations.clone().iter() {
        if user_operation.sender != user_operations[0].sender {
            error!(
                "user_operation.sender: {}, user_operations[0].sender: {}",
                user_operation.sender, user_operations[0].sender
            );
            return Err(AppError::BadRequest);
        }
    }

    // Get the sender address.
    let sender_address: Address = user_operations[0].sender.parse()?;

    // -------------------------------------------------------------------------
    // Merkle
    // -------------------------------------------------------------------------

    // Order the user operations by their chain id, and put the hashes into a vector.

    // First, sort the user operations by their chain id.
    let sorted_user_operations = user_operations.clone();

    // Then, get the hashes of the user operations.
    let mut leaf_hashes: Vec<[u8; 32]> = sorted_user_operations
        .iter()
        .map(|user_operation| {
            let base_hash = B256::from_str(&user_operation.hash).unwrap();
            base_hash.0
        })
        .collect();

    // Sort the leaf hashes.
    leaf_hashes.sort();

    // If the number of leaf hashes is not divisible by 2, add a empty hash to the end.
    // if leaf_hashes.len() % 2 != 0 {
    //     leaf_hashes.push([0; 32]);
    // }

    // Create the merkle tree from the hashes.
    let mut merkle_tree = MerkleTree::new();
    for leaf in leaf_hashes {
        merkle_tree.insert(FixedBytes::from_slice(&leaf));
    }
    merkle_tree.finish();
    // Get the merkle root from the merkle tree.
    let merkle_root = format!("0x{}", merkle_tree.root.encode_hex());
    info!(?merkle_root);

    // Check that the merkle root is the same as the one provided.
    if params.merkle_root != merkle_root {
        error!("params.merkle_root: {}, merkle_root: 0x{}", params.merkle_root, merkle_root);
        return Err(AppError::BadRequest);
    }

    // -------------------------------------------------------------------------
    // Signature
    // -------------------------------------------------------------------------

    // Check that the signature is valid.
    let sig_bytes = sig.signature.hex_to_bytes()?;

    let subdigest = render_subdigest(
        // Hardcode to 0 because it's a chain agnostic operation
        0_u64,
        sender_address,
        params.merkle_root.hex_to_bytes32()?,
    )?;
    info!(?subdigest);

    let recovered_sig = recover_ecdsa_signature(&sig_bytes, &subdigest, 0)?;
    info!(?recovered_sig);

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

    // If the owner is not found, return a 404.
    let owner = owner.ok_or(AppError::NotFound)?;

    // Get the user id from the owner.
    let user_id = match owner.user_id {
        Some(id) => id,
        None => return Err(AppError::NotFound),
    };

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address.to_checksum(None) !=
        owner.address.parse::<Address>()?.to_checksum(None)
    {
        error!(
            "recovered_sig.address: {}, owner.address: {}",
            recovered_sig.address, owner.address
        );
        return Err(AppError::BadRequest);
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallet from the database.
    let wallet = state
        .client
        .wallet()
        .find_unique(wallet::address::equals(sender_address.to_checksum(None)))
        .exec()
        .await?;
    info!(?wallet);

    // If the wallet is not found, return a 404.
    let wallet = wallet.ok_or(AppError::NotFound)?;

    // If the wallet address is not equal to user operation sender, return a 400.
    if wallet.address != sender_address.to_checksum(None) {
        error!(
            "user_operation.sender: {}, wallet.address: {}",
            sender_address.to_checksum(None),
            wallet.address
        );
        return Err(AppError::BadRequest);
    }

    // Get the current configuration for the wallet.
    let configuration = state
        .client
        .configuration()
        .find_first(vec![configuration::address::equals(sender_address.to_checksum(None))])
        .order_by(configuration::checkpoint::order(Direction::Desc))
        .with(configuration::owners::fetch(vec![]))
        .exec()
        .await?;
    info!(?configuration);

    // If the configuration is not found, return a 404.
    let configuration = configuration.ok_or(AppError::NotFound)?;

    // If the owners are not found, return a 404.
    let owners = configuration.owners.ok_or(AppError::NotFound)?;
    info!(?owners);

    // Check that the signature sender is one of the owners.
    if !owners.iter().any(|owner| owner.id == sig.owner_id) {
        error!("owners not found sig.owner_id: {}, owners: {:?}", sig.owner_id, owners);
        return Err(AppError::BadRequest);
    }

    // Create the merkle root in the database.
    let uop_merkle = state
        .client
        .user_operation_merkle()
        .upsert(
            user_operation_merkle::root::equals(merkle_root.clone()),
            user_operation_merkle::create(merkle_root.clone(), vec![]),
            vec![],
        )
        .exec()
        .await?;
    info!(?uop_merkle);

    // The return value of the user operations.
    let mut return_user_operations = vec![];

    // Iterate through the user operations and create them in the database.
    for user_operation in user_operations.clone().into_iter() {
        let chain_id = user_operation.clone().chain_id;
        let user_operation_hash = user_operation.clone().hash;

        // The optional params to connect paymaster to user_operation.
        let mut params = vec![
            user_operation::is_testnet::set(is_testnet(chain_id as u64)),
            user_operation::user_operation_merkle::connect(user_operation_merkle::root::equals(
                uop_merkle.clone().root,
            )),
        ];

        // Parse the paymaster_and_data for the paymaster data if the paymaster is provided.
        if user_operation.paymaster_and_data.len() > 2 {
            let paymaster_data = user_operation.paymaster_and_data.hex_to_bytes()?;
            let (decded_paymaster_address, valid_until, valid_after, _msg) =
                decode_paymaster_and_data(paymaster_data)?;

            let paymaster = state
                .client
                .paymaster()
                .upsert(
                    paymaster::address_chain_id(
                        decded_paymaster_address.to_checksum(None),
                        chain_id,
                    ),
                    paymaster::create(
                        decded_paymaster_address.to_checksum(None),
                        chain::id::equals(chain_id),
                        vec![],
                    ),
                    vec![],
                )
                .exec()
                .await?;
            info!(?paymaster);

            // Add the paymaster to the params.
            params.push(user_operation::paymaster::connect(paymaster::id::equals(
                paymaster.clone().id,
            )));

            // This could potentially not found (not our paymaster), so we should handle it.
            let paymaster_operation = state
                .client
                .paymaster_operation()
                .find_unique(paymaster_operation::valid_until_valid_after_paymaster_id(
                    DateTime::from_timestamp(valid_until as i64, 0).unwrap().into(),
                    DateTime::from_timestamp(valid_after as i64, 0).unwrap().into(),
                    paymaster.clone().id.clone(),
                ))
                .exec()
                .await;
            info!(?paymaster_operation);

            // Add the paymaster operation to the params.
            if let Ok(Some(op)) = paymaster_operation {
                params.push(user_operation::paymaster_operation::connect(
                    paymaster_operation::id::equals(op.id),
                ));
            }
        }

        // Clone the sig to be used in the closure.
        let chained_sig = sig.clone();

        // Get the rundler hash for the user operation.
        let base_user_operation = BaseUserOperation::try_from(user_operation.clone())?;
        let base_hash = B256::from_str(&user_operation.hash)?;
        let entrypoint = base_user_operation.try_valid_op_hash(chain_id as u64, base_hash)?;

        // Get the merkle proof for the user operation.
        let merkle_proof = merkle_tree
            .create_proof(&base_hash)
            .unwrap()
            // Prepend 0x to each hash
            .siblings
            .iter()
            .map(|x| format!("0x{}", x))
            .collect::<Vec<String>>();

        // Create the user operation in the database w/ the sig.
        let res: Result<(
            lightdotso_prisma::signature::Data,
            lightdotso_prisma::user_operation::Data,
        )> = state
            .client
            ._transaction()
            .run(|client| async move {
                let user_operation = client
                    .user_operation()
                    .create(
                        entrypoint.to_checksum(None),
                        user_operation.hash,
                        user_operation.nonce,
                        user_operation.init_code.hex_to_bytes()?,
                        user_operation.call_data.hex_to_bytes()?,
                        user_operation.call_gas_limit,
                        user_operation.verification_gas_limit,
                        user_operation.pre_verification_gas,
                        user_operation.max_fee_per_gas,
                        user_operation.max_priority_fee_per_gas,
                        user_operation.paymaster_and_data.hex_to_bytes()?,
                        chain::id::equals(chain_id),
                        wallet::address::equals(user_operation.sender),
                        params,
                    )
                    .exec()
                    .await?;
                info!(?user_operation);

                let signature = client
                    .signature()
                    .create(
                        chained_sig.signature.hex_to_bytes()?,
                        chained_sig.signature_type,
                        SignatureProcedure::OnChain,
                        owner::id::equals(chained_sig.owner_id),
                        user_operation::hash::equals(user_operation_hash),
                        vec![],
                    )
                    .exec()
                    .await?;
                info!(?signature);

                Ok((signature, user_operation))
            })
            .await;

        // If the res contains error, log it
        if let Err(e) = &res {
            error!(?e);
        }

        // If the user_operation is not created, return a 500.
        let (signature, user_operation) = res.map_err(|_| AppError::InternalError)?;
        info!(?user_operation);

        // For each merkle proof, create a user_operation_merkle_proof in the database, w/
        // create_many.
        let m_proof = state
            .client
            .user_operation_merkle_proof()
            .create_many(
                merkle_proof
                    .iter()
                    .enumerate()
                    .map(|(i, proof_hash)| {
                        (
                            i as i32,
                            proof_hash.clone(),
                            user_operation.hash.clone(),
                            merkle_root.clone(),
                            vec![],
                        )
                    })
                    .collect::<Vec<_>>(),
            )
            .exec()
            .await;
        info!(?m_proof);

        // Add the user operation to the return value.
        return_user_operations.push(user_operation.clone());

        // ---------------------------------------------------------------------
        // Kafka
        // ---------------------------------------------------------------------

        // Send the user operation to the node if the flag is set.
        if is_direct_send {
            // If the owner's signature's culmative weight is greater than the threshold, queue
            if owner.weight >= configuration.threshold {
                // Send all user operations to the node.
                for user_operation in user_operations.clone().iter() {
                    let base_hash = B256::from_str(&user_operation.hash)?;

                    // Send the user operation to the node.
                    let _ = produce_node_message(
                        state.producer.clone(),
                        &NodeMessage { hash: base_hash },
                    )
                    .await;
                }
            }
        }

        // Produce an activity message.
        let _ = produce_activity_message(
            state.producer.clone(),
            ActivityEntity::Signature,
            &ActivityMessage {
                operation: ActivityOperation::Create,
                log: serde_json::to_value(user_operation.clone())?,
                params: CustomParams {
                    signature_id: Some(signature.id.clone()),
                    user_id: Some(user_id.clone()),
                    wallet_address: Some(wallet.address.clone()),
                    ..Default::default()
                },
            },
        )
        .await;

        // Produce an activity message.
        let _ = produce_activity_message(
            state.producer.clone(),
            ActivityEntity::UserOperation,
            &ActivityMessage {
                operation: ActivityOperation::Create,
                log: serde_json::to_value(&user_operation)?,
                params: CustomParams {
                    user_operation_hash: Some(user_operation.clone().hash.clone()),
                    user_id: Some(user_id.clone()),
                    wallet_address: Some(wallet.address.clone()),
                    ..Default::default()
                },
            },
        )
        .await;
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the user operation to the format that the API expects.
    let user_operations: Vec<UserOperation> =
        return_user_operations.into_iter().map(|u| u.into()).collect();

    Ok(Json::from(user_operations))
}

// Create tests for rundler user operation
// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversion() {
        let user_op = UserOperationCreateParams {
            chain_id: 1,
            hash: "0x9e1a7c8".to_string(),
            sender: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".to_string(),
            nonce: 1,
            init_code: "0x1234".to_string(),
            call_data: "0x5678".to_string(),
            call_gas_limit: 1,
            verification_gas_limit: 1,
            pre_verification_gas: 1,
            max_fee_per_gas: 1,
            max_priority_fee_per_gas: 1,
            paymaster_and_data: "0x1234".to_string(),
        };

        let result = BaseUserOperation::try_from(user_op);

        assert!(result.is_ok());
    }

    #[test]
    fn test_merkle_tree() {
        let hashes = [
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000000000000000000000000000000000000000000003",
        ];

        let mut leaf_hashes: Vec<[u8; 32]> =
            hashes.iter().map(|hash| hash.hex_to_bytes32().unwrap()).collect();

        leaf_hashes.sort();

        for hash in leaf_hashes.iter() {
            println!("0x{}", hex::encode(hash));
        }

        let mut merkle_tree = MerkleTree::new();

        for hash in leaf_hashes.into_iter() {
            merkle_tree.insert(FixedBytes::from_slice(&hash));
        }

        merkle_tree.finish();

        let merkle_root = format!("0x{}", merkle_tree.root.0.encode_hex());

        assert_eq!(
            merkle_root,
            "0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87"
        );

        for hash in hashes.iter() {
            let proof = merkle_tree.create_proof(&hash.hex_to_bytes32().unwrap().into()).unwrap();
            assert!(MerkleTree::verify_proof(&proof));
        }
    }

    #[test]
    fn test_merkle_tree_simple() {
        let hashes = [
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000002",
        ];

        let leaf_hashes: Vec<[u8; 32]> =
            hashes.iter().map(|hash| hash.hex_to_bytes32().unwrap()).collect();

        // leaf_hashes.sort();

        for hash in leaf_hashes.iter() {
            println!("0x{}", hex::encode(hash));
        }

        let mut merkle_tree = MerkleTree::new();

        for hash in leaf_hashes.into_iter() {
            merkle_tree.insert(FixedBytes::from_slice(&hash));
        }

        merkle_tree.finish();

        let merkle_root = format!("0x{}", merkle_tree.root.encode_hex());

        assert_eq!(
            merkle_root,
            "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0"
        );

        for hash in hashes.iter() {
            let proof = merkle_tree.create_proof(&hash.hex_to_bytes32().unwrap().into()).unwrap();
            assert!(MerkleTree::verify_proof(&proof));
        }
    }

    #[test]
    fn test_merkle_tree_simple_deep() {
        let hashes = [
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000000000000000000000000000000000000000000003",
            "0x0000000000000000000000000000000000000000000000000000000000000004",
            "0x0000000000000000000000000000000000000000000000000000000000000005",
        ];

        let mut leaf_hashes: Vec<[u8; 32]> =
            hashes.iter().map(|hash| hash.hex_to_bytes32().unwrap()).collect();

        leaf_hashes.sort();

        for hash in leaf_hashes.iter() {
            println!("0x{}", hex::encode(hash));
        }

        let mut merkle_tree = MerkleTree::new();

        for hash in leaf_hashes.into_iter() {
            merkle_tree.insert(FixedBytes::from_slice(&hash));
        }

        merkle_tree.finish();

        let merkle_root = format!("0x{}", merkle_tree.root.encode_hex());

        assert_eq!(
            merkle_root,
            "0x3856185f708a95a4cef51f6538ed3ea849702a46e020430070ac99c94a831c58"
        );

        for hash in hashes.iter() {
            let proof = merkle_tree.create_proof(&hash.hex_to_bytes32().unwrap().into()).unwrap();
            assert!(MerkleTree::verify_proof(&proof));
        }
    }
}
