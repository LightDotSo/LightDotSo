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

use alloy::primitives::{Address, Bytes, U256};
use eyre::Result;
use lightdotso_contracts::types::{
    EstimateResult, GasAndPaymasterAndData, PackedEstimateResult, PackedGasAndPaymasterAndData,
    PackedUserOperation, PackedUserOperationRequest, UserOperation, UserOperationRequest,
};
use lightdotso_gas::types::GasEstimation;
use lightdotso_jsonrpsee::{
    handle_response,
    types::{Request, Response},
};
use lightdotso_tracing::tracing::{info, warn};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Get the gas and paymaster and data from the pm.
pub async fn get_gas_and_paymaster_and_data(
    rpc_url: String,
    entry_point: Address,
    user_operation: &UserOperationRequest,
    sponsorship_policy: Option<Value>,
) -> Result<Response<GasAndPaymasterAndData>> {
    let params = if let Some(policy) = sponsorship_policy {
        vec![json!(user_operation), json!(entry_point), policy]
    } else {
        vec![json!(user_operation), json!(entry_point)]
    };
    info!("params: {:?}", params);

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "pm_sponsorUserOperation".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response = client.post(rpc_url).json(&req_body).send().await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
}

/// Get the packed gas and paymaster and data from the pm.
pub async fn get_packed_gas_and_paymaster_and_data(
    rpc_url: String,
    entry_point: Address,
    packed_user_operation: &PackedUserOperationRequest,
) -> Result<Response<PackedGasAndPaymasterAndData>> {
    let params = vec![json!(packed_user_operation), json!(entry_point)];
    info!("params: {:?}", params);

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "pm_sponsorUserOperation".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response = client.post(rpc_url).json(&req_body).send().await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
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

/// Estimate the gas for the packed user operation.
pub async fn estimate_packed_user_operation_gas(
    chain_id: u64,
    entry_point: Address,
    packed_user_operation: PackedUserOperationRequest,
) -> Result<Response<PackedEstimateResult>> {
    let params = vec![json!(packed_user_operation), json!(entry_point)];
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

/// Construct the user operation w/ rpc.
pub async fn construct_user_operation(
    chain_id: u64,
    user_operation: UserOperationRequest,
    entry_point: Address,
) -> Result<UserOperation> {
    // If the `preVerificationGas`, `verificationGasLimit`, and `callGasLimit` are set,
    // override the gas estimation for the user operation
    let estimated_user_operation_gas: EstimateResult = if user_operation
        .pre_verification_gas
        .is_some_and(|pre_verification_gas| pre_verification_gas > U256::ZERO) &&
        user_operation
            .verification_gas_limit
            .is_some_and(|verification_gas_limit| verification_gas_limit > U256::ZERO) &&
        user_operation.call_gas_limit.is_some_and(|call_gas_limit| call_gas_limit > U256::ZERO)
    {
        warn!("Overriding the gas estimation for the user operation");
        EstimateResult {
            pre_verification_gas: user_operation.pre_verification_gas.unwrap_or_default(),
            verification_gas_limit: user_operation.verification_gas_limit.unwrap_or_default(),
            call_gas_limit: user_operation.call_gas_limit.unwrap_or_default(),
        }
    } else {
        // If the `estimate_user_operation_gas` is not set, estimate the gas for the user operation.
        estimate_user_operation_gas(chain_id, entry_point, &user_operation).await?.result
    };
    info!("estimated_user_operation_gas: {:?}", estimated_user_operation_gas);

    // If the `maxFeePerGas` and `maxPriorityFeePerGas` are set, include them in the user operation.
    if user_operation.max_fee_per_gas.is_some_and(|max_fee_per_gas| max_fee_per_gas > U256::ZERO) &&
        user_operation
            .max_priority_fee_per_gas
            .is_some_and(|max_priority_fee_per_gas| max_priority_fee_per_gas > U256::ZERO)
    {
        warn!("Overriding the gas estimation for the user operation w/ the maxFeePerGas and maxPriorityFeePerGas");
        return Ok(UserOperation {
            call_data: user_operation.call_data,
            init_code: user_operation.init_code,
            nonce: user_operation.nonce,
            sender: user_operation.sender,
            call_gas_limit: estimated_user_operation_gas.call_gas_limit,
            verification_gas_limit: estimated_user_operation_gas.verification_gas_limit,
            pre_verification_gas: estimated_user_operation_gas.pre_verification_gas,
            max_fee_per_gas: user_operation.max_fee_per_gas.unwrap_or_default(),
            max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas.unwrap_or_default(),
            signature: user_operation.signature,
            paymaster_and_data: Bytes::default(),
        });
    }

    // Get the estimated request gas because required gas parameters are not set.
    let estimated_request_gas = estimate_request_gas_estimation(chain_id).await?.result;

    Ok(UserOperation {
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
        paymaster_and_data: Bytes::default(),
    })
}

/// Construct the packed user operation.
pub async fn construct_packed_user_operation(
    chain_id: u64,
    packed_user_operation: PackedUserOperationRequest,
    entry_point: Address,
) -> Result<PackedUserOperation> {
    // If the `preVerificationGas`, `verificationGasLimit`, and `callGasLimit` are set,
    // override the gas estimation for the user operation
    let estimated_packed_user_operation_gas: PackedEstimateResult = if packed_user_operation
        .pre_verification_gas
        .is_some_and(|pre_verification_gas| pre_verification_gas > U256::ZERO) &&
        packed_user_operation
            .verification_gas_limit
            .is_some_and(|verification_gas_limit| verification_gas_limit > U256::ZERO) &&
        packed_user_operation
            .call_gas_limit
            .is_some_and(|call_gas_limit| call_gas_limit > U256::ZERO)
    {
        warn!("Overriding the gas estimation for the user operation");
        PackedEstimateResult {
            pre_verification_gas: packed_user_operation
                .clone()
                .pre_verification_gas
                .unwrap_or_default(),
            verification_gas_limit: packed_user_operation
                .clone()
                .verification_gas_limit
                .unwrap_or_default(),
            call_gas_limit: packed_user_operation.clone().call_gas_limit.unwrap_or_default(),
            paymaster_verification_gas_limit: packed_user_operation
                .clone()
                .paymaster_verification_gas_limit
                .unwrap_or_default(),
        }
    } else {
        // If the `estimate_packed_user_operation_gas` is not set, estimate the gas for the packed
        // user operation.
        estimate_packed_user_operation_gas(chain_id, entry_point, packed_user_operation.clone())
            .await?
            .result
    };
    info!("estimated_packed_user_operation_gas: {:?}", estimated_packed_user_operation_gas);

    // If the `maxFeePerGas` and `maxPriorityFeePerGas` are set, include them in the user operation.
    if packed_user_operation
        .clone()
        .max_fee_per_gas
        .is_some_and(|max_fee_per_gas| max_fee_per_gas > U256::ZERO) &&
        packed_user_operation
            .clone()
            .max_priority_fee_per_gas
            .is_some_and(|max_priority_fee_per_gas| max_priority_fee_per_gas > U256::ZERO)
    {
        warn!("Overriding the gas estimation for the user operation w/ the maxFeePerGas and maxPriorityFeePerGas");
        return Ok(PackedUserOperation {
            call_data: packed_user_operation.clone().call_data,
            factory: packed_user_operation.clone().factory,
            factory_data: packed_user_operation.clone().factory_data,
            nonce: packed_user_operation.clone().nonce,
            sender: packed_user_operation.clone().sender,
            call_gas_limit: estimated_packed_user_operation_gas.call_gas_limit,
            verification_gas_limit: estimated_packed_user_operation_gas.verification_gas_limit,
            pre_verification_gas: estimated_packed_user_operation_gas.pre_verification_gas,
            max_fee_per_gas: packed_user_operation.clone().max_fee_per_gas.unwrap_or_default(),
            max_priority_fee_per_gas: packed_user_operation
                .clone()
                .max_priority_fee_per_gas
                .unwrap_or_default(),
            signature: packed_user_operation.clone().signature,
            paymaster: packed_user_operation.clone().paymaster,
            paymaster_verification_gas_limit: Some(
                packed_user_operation.clone().paymaster_verification_gas_limit.unwrap_or_default(),
            ),
            paymaster_post_op_gas_limit: Some(
                packed_user_operation.clone().paymaster_post_op_gas_limit.unwrap_or_default(),
            ),
            paymaster_data: packed_user_operation.clone().paymaster_data,
        });
    }

    // Get the estimated request gas because required gas parameters are not set.
    let estimated_request_gas = estimate_request_gas_estimation(chain_id).await?.result;

    Ok(PackedUserOperation {
        call_data: packed_user_operation.clone().call_data,
        factory: packed_user_operation.clone().factory,
        factory_data: packed_user_operation.clone().factory_data,
        nonce: packed_user_operation.clone().nonce,
        sender: packed_user_operation.clone().sender,
        call_gas_limit: estimated_packed_user_operation_gas.call_gas_limit,
        verification_gas_limit: estimated_packed_user_operation_gas.verification_gas_limit,
        pre_verification_gas: estimated_packed_user_operation_gas.pre_verification_gas,
        max_fee_per_gas: estimated_request_gas.high.max_fee_per_gas,
        max_priority_fee_per_gas: estimated_request_gas.high.max_priority_fee_per_gas,
        signature: packed_user_operation.clone().signature,
        paymaster: packed_user_operation.clone().paymaster,
        paymaster_verification_gas_limit: Some(
            packed_user_operation.clone().paymaster_verification_gas_limit.unwrap_or_default(),
        ),
        paymaster_post_op_gas_limit: Some(
            packed_user_operation.clone().paymaster_post_op_gas_limit.unwrap_or_default(),
        ),
        paymaster_data: packed_user_operation.clone().paymaster_data,
    })
}
