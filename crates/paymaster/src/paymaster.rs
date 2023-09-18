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
    paymaster_api::PaymasterServer,
    types::{
        EstimateResult, GasAndPaymasterAndData, PaymasterAndData, UserOperationConstruct,
        UserOperationRequest,
    },
};
use async_trait::async_trait;
use ethers::{
    abi::{encode, Tokenizable},
    core::k256::ecdsa::SigningKey,
    signers::{Signer, Wallet},
    types::{Address, Bytes},
};
use eyre::Result;
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::paymaster::{get_paymaster, UserOperation};
use lightdotso_gas::gas::GasEstimation;
use lightdotso_jsonrpsee::{
    error::JsonRpcError,
    handle_response,
    types::{Request, Response},
};
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

/// The paymaster server implementation.
pub struct PaymasterServerImpl {}

#[async_trait]
impl PaymasterServer for PaymasterServerImpl {
    async fn request_paymaster_and_data(
        &self,
        _chain_id: u64,
        _user_operation: UserOperationRequest,
        _entry_point: Address,
    ) -> RpcResult<PaymasterAndData> {
        return Ok(PaymasterAndData::default());
    }

    async fn request_gas_and_paymaster_and_data(
        &self,
        chain_id: u64,
        user_operation: UserOperationRequest,
        entry_point: Address,
    ) -> RpcResult<GasAndPaymasterAndData> {
        // Construct the user operation w/ rpc.
        let construct = construct_user_operation(chain_id, user_operation, entry_point)
            .await
            .map_err(JsonRpcError::from)?;

        // Get the timestamp
        let timestamp =
            SystemTime::now().duration_since(UNIX_EPOCH).expect("Time went backwards").as_secs();
        let valid_until = 0_u64;
        let valid_after = timestamp;

        // Get the address
        let verifying_paymaster_address = Address::zero();

        // Infinite valid until.
        let hash = get_hash(
            chain_id,
            verifying_paymaster_address,
            construct.clone(),
            valid_until,
            valid_after,
        )
        .await
        .map_err(JsonRpcError::from)?;

        // Sign the message.
        let msg = sign_message(chain_id, hash).await.map_err(JsonRpcError::from)?;

        // Construct the paymaster and data.
        let paymater_and_data = Bytes::from(
            [
                verifying_paymaster_address.as_bytes(),
                &encode(&[0.into_token(), timestamp.into_token()]),
                &msg,
            ]
            .concat(),
        );

        return Ok(GasAndPaymasterAndData {
            call_gas_limit: construct.call_gas_limit,
            verification_gas_limit: construct.verification_gas_limit,
            pre_verification_gas: construct.pre_verification_gas,
            max_fee_per_gas: construct.max_fee_per_gas,
            max_priority_fee_per_gas: construct.max_priority_fee_per_gas,
            paymaster_and_data: paymater_and_data,
        });
    }
}

/// Construct the user operation w/ rpc.
pub async fn construct_user_operation(
    chain_id: u64,
    user_operation: UserOperationRequest,
    entry_point: Address,
) -> Result<UserOperationConstruct> {
    let estimated_user_operation_gas =
        estimate_user_operation_gas(chain_id, entry_point, &user_operation).await?.result;

    let estimated_request_gas = estimate_request_gas_estimation(chain_id).await?.result;

    Ok(UserOperationConstruct {
        call_data: user_operation.call_data,
        init_code: user_operation.init_code,
        nonce: user_operation.nonce,
        sender: user_operation.sender,
        call_gas_limit: estimated_user_operation_gas.call_gas_limit,
        verification_gas_limit: estimated_user_operation_gas.verification_gas_limit,
        pre_verification_gas: estimated_user_operation_gas.pre_verification_gas,
        max_fee_per_gas: estimated_request_gas.average.max_fee_per_gas,
        max_priority_fee_per_gas: estimated_request_gas.average.max_priority_fee_per_gas,
        signature: user_operation.signature,
    })
}

/// Estimate the gas for the request w/ the internal gas API.
pub async fn estimate_request_gas_estimation(chain_id: u64) -> Result<Response<GasEstimation>> {
    let params = vec![json!(chain_id)];

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "gas_requestGasEstimation".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response =
        client.post("http://lightdotso-gas.internal:3000").json(&req_body).send().await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/userop_middleware.rs#L128
/// License: MIT
pub async fn estimate_user_operation_gas(
    chain_id: u64,
    entry_point: Address,
    user_operation: &UserOperationRequest,
) -> Result<Response<EstimateResult>> {
    let params = vec![json!(user_operation), json!(entry_point)];

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "eth_estimateUserOperationGas".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response = client
        .post(format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", chain_id))
        .json(&req_body)
        .send()
        .await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
}

/// Sign a message w/ the paymaster private key.
pub async fn sign_message(chain_id: u64, hash: [u8; 32]) -> Result<Vec<u8>> {
    let wallet: Wallet<SigningKey> =
        std::env::var("PAYMASTER_PRIVATE_KEY").unwrap().parse().unwrap();
    let wallet = wallet.with_chain_id(chain_id);

    let msg = wallet.sign_message(hash).await?;

    Ok(msg.to_vec())
}

/// Get the hash for the paymaster.
pub async fn get_hash(
    chain_id: u64,
    verifying_paymaster_address: Address,
    user_operation: UserOperationConstruct,
    valid_until: u64,
    valid_after: u64,
) -> Result<[u8; 32]> {
    // Get the contract.
    let contract = get_paymaster(chain_id, verifying_paymaster_address).await?;

    // Get the hash.
    let hash = contract
        .get_hash(
            UserOperation {
                sender: user_operation.sender,
                nonce: user_operation.nonce,
                init_code: user_operation.init_code,
                call_data: user_operation.call_data,
                call_gas_limit: user_operation.call_gas_limit,
                verification_gas_limit: user_operation.verification_gas_limit,
                pre_verification_gas: user_operation.pre_verification_gas,
                max_fee_per_gas: user_operation.max_fee_per_gas,
                max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas,
                paymaster_and_data: Bytes::default(),
                signature: user_operation.signature,
            },
            valid_until,
            valid_after,
        )
        .await?;

    Ok(hash)
}
