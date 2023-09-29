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
    abi::{encode, Token},
    core::k256::ecdsa::SigningKey,
    signers::{Signer, Wallet},
    types::{Address, Bytes},
};
use eyre::{eyre, Result};
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::{
    constants::LIGHT_PAYMASTER_ADDRESS,
    paymaster::{get_paymaster, UserOperation},
};
use lightdotso_gas::gas::GasEstimation;
use lightdotso_jsonrpsee::{
    error::JsonRpcError,
    handle_response,
    types::{Request, Response},
};
use lightdotso_tracing::tracing::{info, warn};
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

/// The paymaster server implementation.
pub struct PaymasterServerImpl {}

#[async_trait]
impl PaymasterServer for PaymasterServerImpl {
    async fn request_paymaster_and_data(
        &self,
        _user_operation: UserOperationRequest,
        _entry_point: Address,
        _chain_id: u64,
    ) -> RpcResult<PaymasterAndData> {
        // Return the default.
        return Ok(PaymasterAndData::default());
    }

    async fn request_gas_and_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasAndPaymasterAndData> {
        // Construct the user operation w/ rpc.
        let construct = construct_user_operation(chain_id, user_operation, entry_point)
            .await
            .map_err(JsonRpcError::from)?;
        info!("construct: {:?}", construct);

        // Get the timestamp
        let timestamp =
            SystemTime::now().duration_since(UNIX_EPOCH).expect("Time went backwards").as_secs();
        let valid_until = 0_u64;
        let valid_after = timestamp;

        // Get the paymaster and data.
        let paymater_and_data =
            get_paymaster_and_data(chain_id, construct.clone(), valid_until, valid_after).await?;

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

/// Construct the paymaster and data.
pub async fn get_paymaster_and_data(
    chain_id: u64,
    construct: UserOperationConstruct,
    valid_until: u64,
    valid_after: u64,
) -> RpcResult<Bytes> {
    // Get the address
    let verifying_paymaster_address = *LIGHT_PAYMASTER_ADDRESS;

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
    let msg = sign_message(hash, chain_id).await.map_err(JsonRpcError::from)?;

    // Construct the paymaster and data.
    let paymater_and_data =
        construct_paymaster_and_data(verifying_paymaster_address, valid_until, valid_after, &msg);

    Ok(paymater_and_data)
}

/// Construct the paymaster and data.
fn construct_paymaster_and_data(
    verifying_paymaster_address: Address,
    valid_until: u64,
    valid_after: u64,
    msg: &[u8],
) -> Bytes {
    let tokens = vec![Token::Uint(valid_until.into()), Token::Uint(valid_after.into())];
    let encoded_tokens = encode(&tokens);

    // Return the paymaster and data.
    Bytes::from([verifying_paymaster_address.as_bytes(), &encoded_tokens, msg].concat())
}

/// Construct the user operation w/ rpc.
pub async fn construct_user_operation(
    chain_id: u64,
    user_operation: UserOperationRequest,
    entry_point: Address,
) -> Result<UserOperationConstruct> {
    // If the `preVerificationGas`, `verificationGasLimit`, and `callGasLimit` are set,
    // override the gas estimation for the user operatioin
    let estimated_user_operation_gas: EstimateResult = if user_operation
        .pre_verification_gas
        .is_some_and(|pre_verification_gas| pre_verification_gas > 0.into())
        && user_operation
            .verification_gas_limit
            .is_some_and(|verification_gas_limit| verification_gas_limit > 0.into())
        && user_operation.call_gas_limit.is_some_and(|call_gas_limit| call_gas_limit > 0.into())
    {
        warn!("Overriding the gas estimation for the user operation");
        EstimateResult {
            pre_verification_gas: user_operation.pre_verification_gas.unwrap(),
            verification_gas_limit: user_operation.verification_gas_limit.unwrap(),
            call_gas_limit: user_operation.call_gas_limit.unwrap(),
        }
    } else {
        // If the `estimate_user_operation_gas` is not set, estimate the gas for the user operation.
        estimate_user_operation_gas(chain_id, entry_point, &user_operation).await?.result
    };
    info!("estimated_user_operation_gas: {:?}", estimated_user_operation_gas);

    // If the `maxFeePerGas` and `maxPriorityFeePerGas` are set, include them in the user operation.
    if user_operation.max_fee_per_gas.is_some_and(|max_fee_per_gas| max_fee_per_gas > 0.into())
        && user_operation
            .max_priority_fee_per_gas
            .is_some_and(|max_priority_fee_per_gas| max_priority_fee_per_gas > 0.into())
    {
        warn!("Overriding the gas estimation for the user operation w/ the maxFeePerGas and maxPriorityFeePerGas");
        return Ok(UserOperationConstruct {
            call_data: user_operation.call_data,
            init_code: user_operation.init_code,
            nonce: user_operation.nonce,
            sender: user_operation.sender,
            call_gas_limit: estimated_user_operation_gas.call_gas_limit,
            verification_gas_limit: estimated_user_operation_gas.verification_gas_limit,
            pre_verification_gas: estimated_user_operation_gas.pre_verification_gas,
            max_fee_per_gas: user_operation.max_fee_per_gas.unwrap(),
            max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas.unwrap(),
            signature: user_operation.signature,
        });
    }

    // Get the estimated request gas because required gas parameters are not set.
    let estimated_request_gas = estimate_request_gas_estimation(chain_id).await?.result;

    Ok(UserOperationConstruct {
        call_data: user_operation.call_data,
        init_code: user_operation.init_code,
        nonce: user_operation.nonce,
        sender: user_operation.sender,
        call_gas_limit: estimated_user_operation_gas.call_gas_limit,
        verification_gas_limit: estimated_user_operation_gas.verification_gas_limit,
        pre_verification_gas: estimated_user_operation_gas.pre_verification_gas,
        max_fee_per_gas: estimated_request_gas.high.max_fee_per_gas,
        max_priority_fee_per_gas: estimated_request_gas.high.max_priority_fee_per_gas,
        signature: user_operation.signature,
    })
}

/// Estimate the gas for the request w/ the internal gas API.
pub async fn estimate_request_gas_estimation(chain_id: u64) -> Result<Response<GasEstimation>> {
    let params = vec![chain_id];
    info!("params: {:?}", params);

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
    info!("params: {:?}", params);

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
pub async fn sign_message(hash: [u8; 32], chain_id: u64) -> Result<Vec<u8>> {
    let wallet: Wallet<SigningKey> =
        std::env::var("PAYMASTER_PRIVATE_KEY").unwrap().parse().unwrap();
    let wallet = wallet.with_chain_id(chain_id);

    // Check if the address matches the paymaster address w/ env `PAYMASTER_ADDRESS`.
    let address = wallet.address();
    let verifying_paymaster_address = *LIGHT_PAYMASTER_ADDRESS;
    if address != verifying_paymaster_address {
        return Err(eyre!(
            "The address {:?} does not match the paymaster address {:?}",
            address,
            verifying_paymaster_address
        ));
    }

    let msg = wallet.sign_message(hash).await?;

    Ok(msg.to_vec())
}

/// Get the hash for the paymaster.
async fn get_hash(
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

#[cfg(test)]
mod tests {
    use super::*;
    use ethers::{types::U256, utils::hex};

    #[tokio::test]
    async fn test_get_hash() {
        // Arbitrary test inputs
        let chain_id = 1;
        let verifying_paymaster_address = *LIGHT_PAYMASTER_ADDRESS;
        let user_operation = UserOperationConstruct {
            sender: "0x0476DF9D2faa5C019d51E6684eFC37cB4f7b8b14".parse().unwrap(),
            nonce: U256::from(0),
            init_code: "0x".parse().unwrap(),
            call_data: "0x".parse().unwrap(),
            call_gas_limit: U256::from(0),
            verification_gas_limit: U256::from(150000),
            pre_verification_gas: U256::from(21000),
            max_fee_per_gas: U256::from(1091878423),
            max_priority_fee_per_gas: U256::from(1000000000),
            signature: "0x983f1a8c786be7a3661666abe8af0e687cd429ffc304c2593b52c4fd052b9f2734eddf9a64f718106fe7ad8975ea5291d5018a9adfb4172fef2321c948ba80c51c".parse().unwrap(),
        };
        let valid_until = u64::from_str_radix("00000000deadbeef", 16).unwrap();
        let valid_after = u64::from_str_radix("0000000000001234", 16).unwrap();

        let result = get_hash(
            chain_id,
            verifying_paymaster_address,
            user_operation,
            valid_until,
            valid_after,
        )
        .await;

        let expected_bytes: [u8; 32] =
            hex::decode("52ac45c943745ef1a2e46780b28ad686c193b508a5e45cd8cd68c0c3c7e3fc67")
                .expect("Decoding failed")
                .try_into()
                .expect("Expected byte length does not match");

        // Assert that the result matches the expected value
        assert_eq!(result.unwrap(), expected_bytes);
    }

    #[tokio::test]
    async fn test_sign_message() {
        // Specify a private key (This is a dummy key for the test)
        let private_key_str = "0000000000000000000000000000000000000000000000000000000000000001";

        // Set the private key as an environment variable
        std::env::set_var("PAYMASTER_PRIVATE_KEY", private_key_str);

        // Specified test inputs
        let chain_id = 1;
        let hash: [u8; 32] =
            hex::decode("6cda338264c27d259de3ab19f2414ca606265918ed9b15568de0a002e6151309")
                .unwrap()
                .try_into()
                .unwrap();

        // Call our function
        let result = sign_message(hash, chain_id).await;

        // The expected signature
        let expected_signature: Vec<u8> = hex::decode("dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Assert that the result matches the expected value
        assert_eq!(result.unwrap(), expected_signature);
    }

    #[test]
    fn test_construct_paymaster_and_data() {
        // Test input values.
        let verifying_paymaster_address =
            "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82".parse().unwrap();
        let valid_until = u64::from_str_radix("00000000deadbeef", 16).unwrap();
        let valid_after = u64::from_str_radix("0000000000001234", 16).unwrap();
        let msg: Vec<u8> = hex::decode("dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Call the function
        let result = construct_paymaster_and_data(
            verifying_paymaster_address,
            valid_until,
            valid_after,
            &msg,
        );

        // Expected result.
        let expected_result: Vec<u8> = hex::decode("0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Assert that the result matches the expected value
        assert_eq!(result, expected_result);

        // Validate the result.
        assert_eq!(result.len(), 20 + 64 + msg.len());
    }
}
