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
    types::{Address, Bytes, Signature},
    utils::{hash_message, hex, keccak256, to_checksum},
};
use eyre::{eyre, Result};
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::constants::LIGHT_PAYMASTER_ADDRESS;
use lightdotso_db::db::{
    create_client, create_paymaster_operation, get_most_recent_paymaster_operation_with_sender,
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
        let (paymater_and_data, paymaster_nonce) =
            get_paymaster_and_data(chain_id, construct.clone(), valid_until, valid_after).await?;

        Ok(GasAndPaymasterAndData {
            call_gas_limit: construct.call_gas_limit,
            verification_gas_limit: construct.verification_gas_limit,
            pre_verification_gas: construct.pre_verification_gas,
            max_fee_per_gas: construct.max_fee_per_gas,
            max_priority_fee_per_gas: construct.max_priority_fee_per_gas,
            paymaster_and_data: paymater_and_data,
            paymaster_nonce: paymaster_nonce.into(),
        })
    }
}

/// Construct the paymaster and data.
pub async fn get_paymaster_and_data(
    chain_id: u64,
    construct: UserOperationConstruct,
    valid_until: u64,
    valid_after: u64,
) -> RpcResult<(Bytes, u64)> {
    info!(chain_id, valid_until, valid_after);

    // Attempt to sign the message w/ the KMS.
    let kms_res = sign_message_kms(chain_id, construct.clone(), valid_until, valid_after).await;

    // If the KMS signer is available, use it.
    // Otherwise, fall back to the private key.
    match kms_res {
        Ok((msg, verifying_paymaster_address, paymaster_nonce)) => {
            // Construct the paymaster and data.
            let paymater_and_data = construct_paymaster_and_data(
                verifying_paymaster_address,
                valid_until,
                valid_after,
                Some(&msg),
            );
            info!("paymater_and_data: 0x{}", hex::encode(paymater_and_data.clone()));

            // Finally, create the paymaster operation.
            db_create_paymaster_operation(
                chain_id as i64,
                verifying_paymaster_address,
                construct.sender,
                valid_until,
                valid_after,
            )
            .await
            .map_err(JsonRpcError::from)?;

            Ok((paymater_and_data, paymaster_nonce))
        }
        Err(_) => {
            // Fallback to the environment fallback address
            let verifying_paymaster_address = *LIGHT_PAYMASTER_ADDRESS;
            info!(
                "verifying_paymaster_address: {}",
                to_checksum(&verifying_paymaster_address, None)
            );

            let paymaster_nonce = db_get_paymaster_nonce(
                chain_id as i64,
                verifying_paymaster_address,
                construct.sender,
            )
            .await
            .map_err(JsonRpcError::from)?;

            // Infinite valid until.
            let hash = get_hash(
                chain_id,
                verifying_paymaster_address,
                construct.clone(),
                valid_until,
                valid_after,
                paymaster_nonce,
            )
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

            // Finally, create the paymaster operation.
            db_create_paymaster_operation(
                chain_id as i64,
                verifying_paymaster_address,
                construct.sender,
                valid_until,
                valid_after,
            )
            .await
            .map_err(JsonRpcError::from)?;

            Ok((paymater_and_data, paymaster_nonce))
        }
    }
}

pub async fn db_create_paymaster_operation(
    chain_id: i64,
    paymaster_address: Address,
    sender_address: Address,
    valid_until: u64,
    valid_after: u64,
) -> Result<()> {
    // Create the client.
    let client = create_client().await.unwrap();

    // Create the paymaster operation.
    create_paymaster_operation(
        client.into(),
        chain_id,
        paymaster_address,
        sender_address,
        valid_until,
        valid_after,
    )
    .await?;

    Ok(())
}

pub async fn db_get_paymaster_nonce(
    chain_id: i64,
    verifying_paymaster_address: Address,
    sender_address: Address,
) -> Result<u64> {
    // Create the client.
    let client = create_client().await.unwrap();

    // Get the paymaster from the database.
    let paymaster_op = get_most_recent_paymaster_operation_with_sender(
        client.into(),
        chain_id,
        verifying_paymaster_address,
        sender_address,
    )
    .await?;

    // If the user operation is not found, return 0 as Ok.
    match paymaster_op {
        Some(op) => Ok((op.sender_nonce as u64) + 1),
        None => Ok(0),
    }
}

/// Construct the paymaster and data.
pub fn construct_paymaster_and_data(
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
) -> Result<(Vec<u8>, Address, u64)> {
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

    // Get the paymaster nonce.
    let paymaster_nonce =
        db_get_paymaster_nonce(chain_id as i64, verifying_paymaster_address, construct.sender)
            .await?;

    // Infinite valid until.
    let hash = get_hash(
        chain_id,
        verifying_paymaster_address,
        construct.clone(),
        valid_until,
        valid_after,
        paymaster_nonce,
    )?;
    info!("hash: 0x{}", hex::encode(hash));

    // Convert to typed message
    let initial_msg = signer.sign_message(hash).await?;
    info!("initial_msg: 0x{}", hex::encode(initial_msg.to_vec()));

    // Parse the recovery id
    let id = initial_msg.recovery_id().unwrap();
    info!("id: {:?}", id);

    // Overwrite the recovery id  - accepts only v instead 27/28
    // From: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/93993ceadef0ebe2d88b5620eaa889deb10fae84/contracts/cryptography/ECDSA.sol#L41
    // License: MIT
    let msg = Signature { r: initial_msg.r, s: initial_msg.s, v: (u8::from(id) + 27).into() };
    info!("msg: 0x{}", hex::encode(msg.to_vec()));

    let recovered_address = msg.recover(hash_message(hash))?;
    info!("recovered_address: {:?}", recovered_address);
    info!("signer_address: {:?}", signer.address());

    Ok((msg.to_vec(), verifying_paymaster_address, paymaster_nonce))
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
/// From: https://github.com/eth-infinitism/account-abstraction/blob/48854ef5ada1c966475b2074703ad983329faacf/contracts/samples/VerifyingPaymaster.sol#L35
/// License: GPL-3.0
pub fn get_hash(
    chain_id: u64,
    verifying_paymaster_address: Address,
    user_operation: UserOperationConstruct,
    valid_until: u64,
    valid_after: u64,
    paymaster_nonce: u64,
) -> Result<[u8; 32]> {
    Ok(keccak256(encode(&[
        get_pack(user_operation),
        Token::Uint(chain_id.into()),
        Token::Address(verifying_paymaster_address),
        Token::Uint(paymaster_nonce.into()),
        Token::Uint(valid_until.into()),
        Token::Uint(valid_after.into()),
    ])))
}

pub fn get_pack(user_operation: UserOperationConstruct) -> Token {
    // Get the base for `init_code` and `call_data`.
    let init_code_base = if user_operation.init_code.is_empty() {
        0
    } else {
        (user_operation.init_code.len() + 31) / 32
    };
    let call_data_base = if user_operation.call_data.is_empty() {
        0
    } else {
        (user_operation.call_data.len() + 31) / 32
    };

    // https://github.com/LightDotSo/LightDotSo/blob/abff2aca61a8f0934e533d0d352978055fddbd96/contracts/samples/VerifyingPaymaster.sol#L44
    // Get the offset.
    // 0x1a0 = 416
    let offset = 416 + (init_code_base + call_data_base) * 32;

    // https://github.com/LightDotSo/LightDotSo/blob/abff2aca61a8f0934e533d0d352978055fddbd96/contracts/samples/VerifyingPaymaster.sol#L45
    // Get the length.
    // 0x260 = 608
    let length = 608 + (init_code_base + call_data_base) * 32;

    Token::Bytes(encode(&[
        Token::Address(user_operation.sender),
        Token::Uint(user_operation.nonce),
        Token::Bytes(user_operation.init_code.to_vec()),
        Token::Bytes(user_operation.call_data.to_vec()),
        Token::Uint(user_operation.call_gas_limit),
        Token::Uint(user_operation.verification_gas_limit),
        Token::Uint(user_operation.pre_verification_gas),
        Token::Uint(user_operation.max_fee_per_gas),
        Token::Uint(user_operation.max_priority_fee_per_gas),
        Token::Uint(offset.into()),
        Token::Uint(length.into()),
    ]))
}

#[cfg(test)]
mod tests {
    use super::*;
    use ethers::{types::U256, utils::hex};
    use lightdotso_common::traits::VecU8ToHex;
    use lightdotso_contracts::{
        constants::LIGHT_PAYMASTER_ADDRESS,
        paymaster::{get_paymaster, UserOperation},
    };

    #[tokio::test]
    async fn test_get_hash() {
        // Arbitrary test inputs
        let chain_id = 1;
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
        // Temporarily clone the user operation.
        let user_operation_clone = user_operation.clone();
        let valid_until = 0_u64;
        let valid_after = 0_u64;

        let result = get_hash(
            chain_id,
            verifying_paymaster_address,
            user_operation,
            valid_until,
            valid_after,
            0,
        );

        let contract = get_paymaster(chain_id, verifying_paymaster_address).await.unwrap();
        let user_operation = user_operation_clone.clone();

        // Get the hash.
        let onchain_hash = contract
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
            .await
            .unwrap();

        let expected_bytes: [u8; 32] =
            hex::decode("b2072a8f48b9b898d026920dc502740e4786e67eca4ab132ff4336a78f7e73f8")
                .expect("Decoding failed")
                .try_into()
                .expect("Expected byte length does not match");

        let result = result.unwrap();

        println!(
            "paymaster_and_data: {}",
            construct_paymaster_and_data(
                verifying_paymaster_address,
                valid_until,
                valid_after,
                None,
            )
            .to_vec()
            .to_hex_string()
        );

        // Print the result
        println!("result: {}", result.to_vec().to_hex_string());
        println!("onchain_hash: {}", onchain_hash.to_vec().to_hex_string());
        println!("expected_bytes: {}", expected_bytes.to_vec().to_hex_string());

        // Assert that the result matches the expected value
        assert_eq!(expected_bytes, onchain_hash);
        assert_eq!(result, onchain_hash);
        assert_eq!(result, expected_bytes);
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
            "0x0DCd1Bf9A1b36cE34237eEaFef220931846BCD82".parse().unwrap();
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
        let expected_result: Vec<u8> = hex::decode("0dcd1bf9a1b36ce34237eeafef220931846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Assert that the result matches the expected value
        assert_eq!(result, expected_result);

        // Validate the result.
        assert_eq!(result.len(), 20 + 64 + msg.len());
    }

    #[test]
    fn test_get_pack() {
        let user_operation = UserOperationConstruct {
            sender: "0xF46D20dC61A5f43773Ad172602647f194a69a16d".parse().unwrap(),
            nonce: U256::from(0),
            init_code: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c".parse().unwrap(),
            call_data: "0xb61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000".parse().unwrap(),
            call_gas_limit: U256::from(4514240),
            verification_gas_limit: U256::from(1854272),
            pre_verification_gas: U256::from(1854272),
            max_fee_per_gas: U256::from(56674171701_i64),
            max_priority_fee_per_gas: U256::from(48087546673_i64),
            signature: "0xf3d100a507a9cec065dd157ebe9f76f34722791066a9a4e5dd1c09666f180c8f44ac0f769495f53cf4fcbbcc94fa4520c02a0dd316642ea0972b5114309d7e031b02".parse().unwrap(),
        };

        // println!("{}", user_operation.init_code.len());
        // println!("{}", user_operation.call_data.len());

        // println!(
        //     "{}",
        //     416 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        // println!(
        //     "{}",
        //     480 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        let packed = get_pack(user_operation.clone()).into_bytes().unwrap();

        println!("{}", packed.to_hex_string());

        let enco = encode(&[
            Token::Bytes(packed),
            Token::Uint(31337.into()),
            Token::Address("0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
        ])
        .to_vec();

        println!("{}", enco.to_hex_string());

        let has = get_hash(
            31337,
            "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap(),
            user_operation,
            0,
            0,
            0,
        );

        // println!("{}", has.unwrap().to_vec().to_hex_string());

        assert_eq!(
            has.unwrap().to_vec().to_hex_string(),
            "0xa749d89e61a458fc75fcb5ed670364326e5a8975268338790b39dc1cd472c0a2"
        )
    }

    #[test]
    fn test_get_pack_init_code() {
        let user_operation = UserOperationConstruct {
            sender: "0xF46D20dC61A5f43773Ad172602647f194a69a16d".parse().unwrap(),
            nonce: U256::from(0),
            init_code: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
            call_data: "0x".parse().unwrap(),
            call_gas_limit: U256::from(4514240),
            verification_gas_limit: U256::from(1854272),
            pre_verification_gas: U256::from(1854272),
            max_fee_per_gas: U256::from(56674171701_i64),
            max_priority_fee_per_gas: U256::from(48087546673_i64),
            signature: "0xf3d100a507a9cec065dd157ebe9f76f34722791066a9a4e5dd1c09666f180c8f44ac0f769495f53cf4fcbbcc94fa4520c02a0dd316642ea0972b5114309d7e031b02".parse().unwrap(),
        };

        // println!("{}", user_operation.init_code.len());
        // println!("{}", user_operation.call_data.len());

        // println!(
        //     "{}",
        //     416 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        // println!(
        //     "{}",
        //     480 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        let packed = get_pack(user_operation.clone()).into_bytes().unwrap();

        println!("{}", packed.to_hex_string());

        let enco = encode(&[
            Token::Bytes(packed),
            Token::Uint(31337.into()),
            Token::Address("0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
        ])
        .to_vec();

        println!("{}", enco.to_hex_string());

        let has = get_hash(
            31337,
            "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap(),
            user_operation,
            0,
            0,
            0,
        );

        // println!("{}", has.unwrap().to_vec().to_hex_string());

        assert_eq!(
            has.unwrap().to_vec().to_hex_string(),
            "0xe850e21692a538c5703de1fd2574a2a018a62422834f6f1e70b1947e43354714"
        )
    }

    #[test]
    fn test_get_pack_call_data() {
        let user_operation = UserOperationConstruct {
            sender: "0xF46D20dC61A5f43773Ad172602647f194a69a16d".parse().unwrap(),
            nonce: U256::from(0),
            init_code: "0x".parse().unwrap(),
            call_data: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
            call_gas_limit: U256::from(4514240),
            verification_gas_limit: U256::from(1854272),
            pre_verification_gas: U256::from(1854272),
            max_fee_per_gas: U256::from(56674171701_i64),
            max_priority_fee_per_gas: U256::from(48087546673_i64),
            signature: "0xf3d100a507a9cec065dd157ebe9f76f34722791066a9a4e5dd1c09666f180c8f44ac0f769495f53cf4fcbbcc94fa4520c02a0dd316642ea0972b5114309d7e031b02".parse().unwrap(),
        };

        // println!("{}", user_operation.init_code.len());
        // println!("{}", user_operation.call_data.len());

        // println!(
        //     "{}",
        //     416 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        // println!(
        //     "{}",
        //     480 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        let packed = get_pack(user_operation.clone()).into_bytes().unwrap();

        println!("{}", packed.to_hex_string());

        let enco = encode(&[
            Token::Bytes(packed),
            Token::Uint(31337.into()),
            Token::Address("0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
        ])
        .to_vec();

        println!("{}", enco.to_hex_string());

        let has = get_hash(
            31337,
            "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap(),
            user_operation,
            0,
            0,
            0,
        );

        // println!("{}", has.unwrap().to_vec().to_hex_string());

        assert_eq!(
            has.unwrap().to_vec().to_hex_string(),
            "0x31f099b0ed69801e8df3094de635eb718ba0f11cfaeec26bbc64718a5333a727"
        )
    }

    #[test]
    fn test_get_pack_raw() {
        let user_operation = UserOperationConstruct {
            sender: "0xF46D20dC61A5f43773Ad172602647f194a69a16d".parse().unwrap(),
            nonce: U256::from(0),
            init_code: "0x".parse().unwrap(),
            call_data: "0x".parse().unwrap(),
            call_gas_limit: U256::from(4514240),
            verification_gas_limit: U256::from(1854272),
            pre_verification_gas: U256::from(1854272),
            max_fee_per_gas: U256::from(56674171701_i64),
            max_priority_fee_per_gas: U256::from(48087546673_i64),
            signature: "0xf3d100a507a9cec065dd157ebe9f76f34722791066a9a4e5dd1c09666f180c8f44ac0f769495f53cf4fcbbcc94fa4520c02a0dd316642ea0972b5114309d7e031b02".parse().unwrap(),
        };

        // println!("{}", user_operation.init_code.len());
        // println!("{}", user_operation.call_data.len());

        // println!(
        //     "{}",
        //     416 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        // println!(
        //     "{}",
        //     480 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        let packed = get_pack(user_operation.clone()).into_bytes().unwrap();

        println!("{}", packed.to_hex_string());

        let enco = encode(&[
            Token::Bytes(packed),
            Token::Uint(31337.into()),
            Token::Address("0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
        ])
        .to_vec();

        println!("{}", enco.to_hex_string());

        let has = get_hash(
            31337,
            "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap(),
            user_operation,
            0,
            0,
            0,
        );

        // println!("{}", has.unwrap().to_vec().to_hex_string());

        assert_eq!(
            has.unwrap().to_vec().to_hex_string(),
            "0x08d0a789464451b14585094ca52c28662123c7dd6314831a0662aa3f8ca7edf6"
        )
    }

    #[test]
    fn test_get_pack_long() {
        let user_operation = UserOperationConstruct {
            sender: "0xF46D20dC61A5f43773Ad172602647f194a69a16d".parse().unwrap(),
            nonce: U256::from(0),
            init_code: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
            call_data: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
            call_gas_limit: U256::from(4514240),
            verification_gas_limit: U256::from(1854272),
            pre_verification_gas: U256::from(1854272),
            max_fee_per_gas: U256::from(56674171701_i64),
            max_priority_fee_per_gas: U256::from(48087546673_i64),
            signature: "0xf3d100a507a9cec065dd157ebe9f76f34722791066a9a4e5dd1c09666f180c8f44ac0f769495f53cf4fcbbcc94fa4520c02a0dd316642ea0972b5114309d7e031b02".parse().unwrap(),
        };

        // println!("{}", user_operation.init_code.len());
        // println!("{}", user_operation.call_data.len());

        // println!(
        //     "{}",
        //     416 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        // println!(
        //     "{}",
        //     480 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        let packed = get_pack(user_operation.clone()).into_bytes().unwrap();

        println!("{}", packed.to_hex_string());

        let enco = encode(&[
            Token::Bytes(packed),
            Token::Uint(31337.into()),
            Token::Address("0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
        ])
        .to_vec();

        println!("{}", enco.to_hex_string());

        let has = get_hash(
            31337,
            "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap(),
            user_operation,
            0,
            0,
            0,
        );

        // println!("{}", has.unwrap().to_vec().to_hex_string());

        assert_eq!(
            has.unwrap().to_vec().to_hex_string(),
            "0x6854afbd9044acdba83f005054bbc716bc1d643b26f2557c50fd0b5e33bbd719"
        )
    }

    #[test]
    fn test_get_pack_real() {
        let user_operation = UserOperationConstruct {
            sender: "0x407d125a586AeAF0a39FCf81707f3Fd918beD97E".parse().unwrap(),
            nonce: U256::from(0),
            init_code: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c".parse().unwrap(),
            call_data: "0xb61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000".parse().unwrap(),
            call_gas_limit: U256::from(4514240),
            verification_gas_limit: U256::from(1854272),
            pre_verification_gas: U256::from(1854272),
            max_fee_per_gas: U256::from(56674171701_i64),
            max_priority_fee_per_gas: U256::from(48087546673_i64),
            signature: "0xf3d100a507a9cec065dd157ebe9f76f34722791066a9a4e5dd1c09666f180c8f44ac0f769495f53cf4fcbbcc94fa4520c02a0dd316642ea0972b5114309d7e031b02".parse().unwrap(),
        };

        // println!("{}", user_operation.init_code.len());
        // println!("{}", user_operation.call_data.len());

        // println!(
        //     "{}",
        //     416 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        // println!(
        //     "{}",
        //     480 + ((user_operation.init_code.len() + user_operation.call_data.len() + 31) / 32 *
        //         48)
        // );

        let packed = get_pack(user_operation.clone()).into_bytes().unwrap();

        println!("{}", packed.to_hex_string());

        let enco = encode(&[
            Token::Bytes(packed),
            Token::Uint(31337.into()),
            Token::Address("0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
            Token::Uint(0.into()),
        ])
        .to_vec();

        println!("{}", enco.to_hex_string());

        let has = get_hash(
            31337,
            "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9".parse().unwrap(),
            user_operation,
            0,
            0,
            0,
        );

        // println!("{}", has.unwrap().to_vec().to_hex_string());

        assert_eq!(
            has.unwrap().to_vec().to_hex_string(),
            "0x19d4acdb926f56bfb503043742ddec955569d80f1dca67b016a423427c479e06"
        )
    }
}

// pack
// init_code: 88 -> 88/32 = 2..24 -> 3
// call_data: 132 -> 132/32 = 4..0 -> 5
// offset: 672: 0x2a0 -> +256 (8 * 32)
// length: 864: 0x360 -> +256 (8 * 32)
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb310000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000000000000034000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c00000000000000000000000000000000000000000000000000000000000000000000000000000084b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000036000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c00000000000000000000000000000000000000000000000000000000000000000000000000000084b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

// callData
// init_code: 0
// call_data: 88 -> 88/32 = 2..24 -> 3
// offset: 512: 0x200 -> +96 (3 * 32)
// length: 704: 0x2c0 -> +96 (3 * 32)
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000000000
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb31000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000000000

// initCode
// init_code: 88 -> 88/32 = 2..24 -> 3
// call_data: 0
// offset: 512: 0x200 -> +96 (3 * 32)
// length: 704: 0x2c0 -> +96 (3 * 32)
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a075800000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb31000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a075800000000000000000000000000000000000000000000000000000000000000000000000000000000

// raw
// init_code: 0
// call_data: 0
// offset: 416: 0x1a0
// length: 608: 0x260
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

// long
// init_code: 176 -> 176/32 = 5..16 -> 6
// call_data: 88 -> 88/32 = 2..24 -> 3
// offset: 704: 0x2c0 -> +288 (9 * 32)
// length: 896: 0x380 -> +288 (9 * 32)
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb31000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000003800000000000000000000000000000000000000000000000000000000000000b00000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000000000
// 0x000000000000000000000000f46d20dc61a5f43773ad172602647f194a69a16d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000002c0000000000000000000000000000000000000000000000000000000000000038000000000000000000000000000000000000000000000000000000000000000b00000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000000000

// real
// init_code: 88 -> 88/32 = 2..24 -> 3
// call_data: 132 -> 132/32 = 4..0 -> 5
// offset: 672: 0x2a0 -> +256 (8 * 32)
// length: 864: 0x360 -> +256 (8 * 32)
// 0x000000000000000000000000407d125a586aeaf0a39fcf81707f3fd918bed97e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb310000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000000000000034000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c00000000000000000000000000000000000000000000000000000000000000000000000000000084b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 0x000000000000000000000000407d125a586aeaf0a39fcf81707f3fd918bed97e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000036000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c00000000000000000000000000000000000000000000000000000000000000000000000000000084b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
