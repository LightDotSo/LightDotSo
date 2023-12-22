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

use super::types::UserOperation;
use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use ethers_main::{
    types::H160,
    utils::{hex, to_checksum},
};
use eyre::{Report, Result};
use lightdotso_common::{traits::HexToBytes, utils::hex_to_bytes};
use lightdotso_contracts::{
    constants::{ENTRYPOINT_V060_ADDRESS, MAINNET_CHAIN_IDS},
    // constants::{ENTRYPOINT_V060_ADDRESS, LIGHT_PAYMASTER_ADDRESSES},
    paymaster::decode_paymaster_and_data,
};
use lightdotso_prisma::{
    configuration,
    // log,
    owner,
    paymaster,
    paymaster_operation,
    // receipt,
    user_operation,
    wallet,
    SignatureProcedure,
};
use lightdotso_solutions::{signature::recover_ecdsa_signature, utils::render_subdigest};
use lightdotso_tracing::tracing::{error, info};
use prisma_client_rust::{
    chrono::{DateTime, NaiveDateTime, Utc},
    Direction,
};
use rundler_types::UserOperation as RundlerUserOperation;
use serde::{Deserialize, Serialize};
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
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct UserOperationPostRequestParams {
    // The user operation to create.
    pub user_operation: UserOperationCreate,
    // The signature of the user operation.
    pub signature: UserOperationCreateSignature,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Item to create.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationCreate {
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

impl TryFrom<UserOperationCreate> for RundlerUserOperation {
    type Error = Report;

    fn try_from(op: UserOperationCreate) -> Result<Self> {
        Ok(RundlerUserOperation {
            sender: op.sender.parse()?,
            nonce: op.nonce.into(),
            init_code: hex_to_bytes(&op.init_code)?.into(),
            call_data: hex_to_bytes(&op.call_data)?.into(),
            call_gas_limit: op.call_gas_limit.into(),
            verification_gas_limit: op.verification_gas_limit.into(),
            pre_verification_gas: op.pre_verification_gas.into(),
            max_fee_per_gas: op.max_fee_per_gas.into(),
            max_priority_fee_per_gas: op.max_priority_fee_per_gas.into(),
            paymaster_and_data: hex_to_bytes(&op.paymaster_and_data)?.into(),
            signature: vec![].into(),
        })
    }
}

/// User operation signature
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationCreateSignature {
    /// The id of the owner of the signature.
    pub owner_id: String,
    /// The signature in hex string.
    pub signature: String,
    /// The signature type
    pub signature_type: i32,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a user operation
#[utoipa::path(
        post,
        path = "/user_operation/create",
        params(
            PostQuery
        ),
        request_body = UserOperationPostRequestParams,
        responses(
            (status = 200, description = "User Operation created successfully", body = UserOperation),
            (status = 400, description = "Invalid Configuration", body = UserOperationError),
            (status = 409, description = "User Operation already exists", body = UserOperationError),
            (status = 500, description = "User Operation internal error", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_operation_post_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<UserOperationPostRequestParams>,
) -> AppJsonResult<UserOperation> {
    // Get the post query.
    let Query(query) = post_query;
    info!(?query);

    // Get the chain id from the post query.
    let chain_id = query.chain_id;

    let user_operation = params.user_operation.clone();
    let user_operation_hash = params.user_operation.clone().hash;
    let sig = params.signature;

    let rundler_user_operation = RundlerUserOperation::try_from(user_operation.clone())?;
    let rundler_hash = rundler_user_operation.op_hash(*ENTRYPOINT_V060_ADDRESS, chain_id as u64);

    // Assert that the hex hash of rundler_hash is the same as the user_operation_hash (prefix 0x)
    if (format!("0x{}", hex::encode(rundler_hash)) != user_operation_hash) {
        error!(
            "rundler_hash: {}, user_operation_hash: {}",
            hex::encode(rundler_hash),
            user_operation_hash
        );
        return Err(AppError::BadRequest);
    }
    info!("rundler_hash: 0x{}", hex::encode(rundler_hash));

    // Parse the user operation address.
    let sender_address: H160 = user_operation.sender.parse()?;

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

    // Get the owner from the database.
    let owner =
        state.client.owner().find_unique(owner::id::equals(sig.clone().owner_id)).exec().await?;
    info!(?owner);

    // If the owner is not found, return a 404.
    let owner = owner.ok_or(AppError::NotFound)?;

    // Check that the recovered signature is the same as the signature sender.
    if recovered_sig.address != owner.address.parse()? {
        error!(
            "recovered_sig.address: {}, owner.address: {}",
            recovered_sig.address, owner.address
        );
        return Err(AppError::BadRequest);
    }

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
    let mut params =
        vec![user_operation::is_testnet::set(!MAINNET_CHAIN_IDS.contains_key(&(chain_id as u64)))];

    // Parse the paymaster_and_data for the paymaster data if the paymaster is provided.
    if user_operation.paymaster_and_data.len() > 2 {
        let paymaster_data = user_operation.paymaster_and_data.hex_to_bytes()?;
        let (decded_paymaster_address, _, valid_after, _msg) =
            decode_paymaster_and_data(paymaster_data)?;

        let paymaster = state
            .client
            .paymaster()
            .upsert(
                paymaster::address_chain_id(to_checksum(&decded_paymaster_address, None), chain_id),
                paymaster::create(to_checksum(&decded_paymaster_address, None), chain_id, vec![]),
                vec![],
            )
            .exec()
            .await?;
        info!(?paymaster);

        // Add the paymaster to the params.
        params
            .push(user_operation::paymaster::connect(paymaster::id::equals(paymaster.clone().id)));

        // This could potentially not found (not our paymaster), so we should handle it.
        let paymaster_operation = state
            .client
            .paymaster_operation()
            .find_unique(paymaster_operation::valid_after_paymaster_id(
                DateTime::<Utc>::from_utc(
                    NaiveDateTime::from_timestamp_opt(valid_after as i64, 0).unwrap(),
                    Utc,
                )
                .into(),
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

    // Create the user operation in the database w/ the sig.
    let user_operation: Result<lightdotso_prisma::user_operation::Data> = state
        .client
        ._transaction()
        .run(|client| async move {
            let user_operation = client
                .user_operation()
                .create(
                    user_operation.hash,
                    user_operation.sender,
                    user_operation.nonce,
                    user_operation.init_code.hex_to_bytes()?,
                    user_operation.call_data.hex_to_bytes()?,
                    user_operation.call_gas_limit,
                    user_operation.verification_gas_limit,
                    user_operation.pre_verification_gas,
                    user_operation.max_fee_per_gas,
                    user_operation.max_priority_fee_per_gas,
                    user_operation.paymaster_and_data.hex_to_bytes()?,
                    chain_id,
                    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789".parse()?,
                    wallet::address::equals(wallet.address),
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

            Ok(user_operation)
        })
        .await;
    info!(?user_operation);

    // If the user_operation is not created, return a 500.
    let user_operation = user_operation.map_err(|_| AppError::InternalError)?;
    info!(?user_operation);

    // Change the user operation to the format that the API expects.
    let user_operation: UserOperation = user_operation.into();

    Ok(Json::from(user_operation))
}

// Create tests for rundler user operation
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversion() {
        let user_op = UserOperationCreate {
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

        let result = RundlerUserOperation::try_from(user_op);

        assert!(result.is_ok());
    }
}
