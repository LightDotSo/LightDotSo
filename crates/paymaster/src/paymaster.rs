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
    constants::PAYMASTER_ADDRESSES_MAP,
    types::{
        EstimateResult, GasAndPaymasterAndData, PaymasterAndData, UserOperationConstruct,
        UserOperationRequest,
    },
};
use ethers::{
    abi::{encode, Token},
    core::k256::ecdsa::SigningKey,
    signers::{Signer, Wallet},
    types::{Address, Bytes},
    utils::{hash_message, hex, to_checksum},
};
use eyre::{eyre, Result};
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::{
    constants::LIGHT_PAYMASTER_ADDRESS,
    paymaster::{get_paymaster, UserOperation},
};
use lightdotso_gas::types::GasEstimation;
use lightdotso_jsonrpsee::{
    error::JsonRpcError,
    handle_response,
    types::{Request, Response},
};
use lightdotso_signer::connect::connect_to_kms;
use lightdotso_tracing::tracing::{info, warn};
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

/// The paymaster api implementation.
pub(crate) struct PaymasterApi {}

impl PaymasterApi {
    pub(crate) async fn request_paymaster_and_data(
        &self,
        _user_operation: UserOperationRequest,
        _entry_point: Address,
        _chain_id: u64,
    ) -> RpcResult<PaymasterAndData> {
        // Return the default.
        Ok(PaymasterAndData::default())
    }

    pub(crate) async fn request_gas_and_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasAndPaymasterAndData> {
        // Construct the user operation w/ rpc.
        let construct = construct_user_operation(chain_id, user_operation, entry_point)
            .await
            .map_err(JsonRpcError::from)?;
        // Log the construct in hex.
        info!("construct: {:?}", construct);

        // Get the timestamp
        let timestamp =
            SystemTime::now().duration_since(UNIX_EPOCH).expect("Time went backwards").as_secs();
        let valid_until = 0_u64;
        let valid_after = timestamp;

        // Get the paymaster and data.
        let paymater_and_data =
            get_paymaster_and_data(chain_id, construct.clone(), valid_until, valid_after).await?;

        Ok(GasAndPaymasterAndData {
            call_gas_limit: construct.call_gas_limit,
            verification_gas_limit: construct.verification_gas_limit,
            pre_verification_gas: construct.pre_verification_gas,
            max_fee_per_gas: construct.max_fee_per_gas,
            max_priority_fee_per_gas: construct.max_priority_fee_per_gas,
            paymaster_and_data: paymater_and_data,
        })
    }
}

/// Construct the paymaster and data.
pub async fn get_paymaster_and_data(
    chain_id: u64,
    construct: UserOperationConstruct,
    valid_until: u64,
    valid_after: u64,
) -> RpcResult<Bytes> {
    info!(chain_id, valid_until, valid_after);

    // Attempt to sign the message w/ the KMS.
    let kms_res = sign_message_kms(chain_id, construct.clone(), valid_until, valid_after).await;

    // If the KMS signer is available, use it.
    // Otherwise, fall back to the private key.
    match kms_res {
        Ok((msg, verifying_paymaster_address)) => {
            // Construct the paymaster and data.
            let paymater_and_data = construct_paymaster_and_data(
                verifying_paymaster_address,
                valid_until,
                valid_after,
                Some(&msg),
            );
            info!("paymater_and_data: 0x{}", hex::encode(paymater_and_data.clone()));

            Ok(paymater_and_data)
        }
        Err(_) => {
            // Fallback to the environment fallback address
            let verifying_paymaster_address = *LIGHT_PAYMASTER_ADDRESS;
            info!(
                "verifying_paymaster_address: {}",
                to_checksum(&verifying_paymaster_address, None)
            );

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
            info!("hash: 0x{}", hex::encode(hash));

            // Sign the message.
            let msg = sign_message_fallback(hash).await.map_err(JsonRpcError::from)?;

            // Construct the paymaster and data.
            let paymater_and_data = construct_paymaster_and_data(
                verifying_paymaster_address,
                valid_until,
                valid_after,
                Some(&msg),
            );
            info!("paymater_and_data: 0x{}", hex::encode(paymater_and_data.clone()));

            Ok(paymater_and_data)
        }
    }
}

/// Construct the paymaster and data.
fn construct_paymaster_and_data(
    verifying_paymaster_address: Address,
    valid_until: u64,
    valid_after: u64,
    msg: Option<&[u8]>,
) -> Bytes {
    let tokens = vec![Token::Uint(valid_until.into()), Token::Uint(valid_after.into())];
    let encoded_tokens = encode(&tokens);

    // Return the paymaster and data.
    Bytes::from(
        [verifying_paymaster_address.as_bytes(), &encoded_tokens, (msg.unwrap_or(&[0u8; 65]))]
            .concat(),
    )
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
        .is_some_and(|pre_verification_gas| pre_verification_gas > 0.into()) &&
        user_operation
            .verification_gas_limit
            .is_some_and(|verification_gas_limit| verification_gas_limit > 0.into()) &&
        user_operation.call_gas_limit.is_some_and(|call_gas_limit| call_gas_limit > 0.into())
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
    if user_operation.max_fee_per_gas.is_some_and(|max_fee_per_gas| max_fee_per_gas > 0.into()) &&
        user_operation
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
pub async fn sign_message_kms(
    chain_id: u64,
    construct: UserOperationConstruct,
    valid_until: u64,
    valid_after: u64,
) -> Result<(Vec<u8>, Address)> {
    let signer = connect_to_kms().await?.with_chain_id(chain_id);

    // Check if the address matches the paymaster address w/ env `PAYMASTER_ADDRESS` if std env
    // `ENVIROMENT` is `local`.
    let address = signer.address();
    let verifying_paymaster_addresses: Vec<Address> =
        PAYMASTER_ADDRESSES_MAP.keys().cloned().collect();

    // Get the verifying paymaster contract address.
    let verifying_paymaster_address = *PAYMASTER_ADDRESSES_MAP.get(&address).ok_or_else(|| {
        eyre!(
            "The address {:?} does not match one of the paymaster address {:?}",
            address,
            verifying_paymaster_addresses
        )
    })?;
    info!("verifying_paymaster_address: {}", to_checksum(&verifying_paymaster_address, None));

    // Infinite valid until.
    let hash = get_hash(
        chain_id,
        verifying_paymaster_address,
        construct.clone(),
        valid_until,
        valid_after,
    )
    .await?;
    info!("hash: 0x{}", hex::encode(hash));

    // Convert to typed message
    let msg = signer.sign_message(hash).await?;
    info!("msg: 0x{}", hex::encode(msg.to_vec()));

    let recovered_address = msg.recover(hash_message(hash))?;
    info!("recovered_address: {:?}", recovered_address);
    info!("signer_address: {:?}", signer.address());

    Ok((msg.to_vec(), verifying_paymaster_address))
}

/// Sign a message w/ the paymaster private key.
pub async fn sign_message_fallback(hash: [u8; 32]) -> Result<Vec<u8>> {
    // Fall back to the private key if the KMS signer is not available.
    warn!("Falling back to the private key");
    let private_key_str = std::env::var("PAYMASTER_PRIVATE_KEY").unwrap();
    let wallet: Wallet<SigningKey> = private_key_str.parse().unwrap();

    let msg = wallet.sign_message(hash).await?;
    info!("msg: 0x{}", hex::encode(msg.to_vec()));

    let recovered_address = msg.recover(hash_message(hash))?;
    info!("recovered_address: {:?}", recovered_address);
    info!("signer_address: {:?}", wallet.address());

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
                paymaster_and_data: construct_paymaster_and_data(
                    verifying_paymaster_address,
                    valid_until,
                    valid_after,
                    None,
                ),
                signature: Bytes::default(),
            },
            valid_until,
            valid_after,
        )
        .await?;
    info!("hash: 0x{}", hex::encode(hash));

    Ok(hash)
}

#[cfg(test)]
mod tests {
    use super::*;
    use ethers::{types::U256, utils::hex};
    use lightdotso_contracts::constants::LIGHT_PAYMASTER_ADDRESS;

    #[tokio::test]
    async fn test_get_hash() {
        // Arbitrary test inputs
        let chain_id = 11155111;
        let verifying_paymaster_address = *LIGHT_PAYMASTER_ADDRESS;
        let user_operation = UserOperationConstruct {
            sender: Address::zero(),
            nonce: U256::from(0),
            init_code: "0x".parse().unwrap(),
            call_data: "0x".parse().unwrap(),
            call_gas_limit: U256::from(0),
            verification_gas_limit: U256::from(0),
            pre_verification_gas: U256::from(0),
            max_fee_per_gas: U256::from(0),
            max_priority_fee_per_gas: U256::from(0),
            signature: "0x".parse().unwrap(),
        };
        let valid_until = 0_u64;
        let valid_after = 0_u64;

        let result = get_hash(
            chain_id,
            verifying_paymaster_address,
            user_operation,
            valid_until,
            valid_after,
        )
        .await;

        let expected_bytes: [u8; 32] =
            hex::decode("2435cd47d8f5ea2c5d6755619d7a5b886502e8b41a4067aa5cfd3bbdbcb97128")
                .expect("Decoding failed")
                .try_into()
                .expect("Expected byte length does not match");

        // Assert that the result matches the expected value
        assert_eq!(result.unwrap(), expected_bytes);
    }

    #[tokio::test]
    async fn test_sign_message_fallback() {
        // Specify a private key (This is a dummy key for the test)
        let private_key_str = "0000000000000000000000000000000000000000000000000000000000000001";

        // Set the private key as an environment variable
        std::env::set_var("PAYMASTER_PRIVATE_KEY", private_key_str);

        // Set the environment to local
        std::env::set_var("ENVIRONMENT", "local");

        // Specified test inputs
        let hash: [u8; 32] =
            hex::decode("6cda338264c27d259de3ab19f2414ca606265918ed9b15568de0a002e6151309")
                .unwrap()
                .try_into()
                .unwrap();

        // Call our function
        let result = sign_message_fallback(hash).await;

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
            Some(&msg),
        );

        // Expected result.
        let expected_result: Vec<u8> = hex::decode("0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Assert that the result matches the expected value
        assert_eq!(result, expected_result);

        // Validate the result.
        assert_eq!(result.len(), 20 + 64 + msg.len());
    }
}

// 0x000000000054230ba02add2d96fa4362a8606f97000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000653ec76398b946c7c48c66b189884dbc30389f520a4bc99a80896806414974d2755618a84139eebdd66726d239e068e7f1c5a767d1df8c48c0d956bd911d62cbaf33c3b225
// 0x000000000018d32df916ff115a25fbefc70baf8b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006531bd61a1f53204bf02359f43121efdb3ca4369f00a181d265eff50121a823510680b6929f1e732a5e229b78bb3df410ab48cc311dd88cbb8ee63fda8d990c1f1cd457b1b
// 0x000000000003193facb32d1c120719892b7ae977000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000653fd7f856a0c73f95e1c4df8dbe29abeafcbbb697cf2c82fe517f2173e451a7893614cb3ea102b657be4719dc7535463f25cd45888302fad2226562c1e8927bb00dcc1438
//                                                                                                  
// 56a0c73f95e1c4df8dbe29abeafcbbb697cf2c82fe517f2173e451a7893614cb3ea102b657be4719dc7535463f25cd45888302fad2226562c1e8927bb00dcc1438
