// Copyright 2023-2024 Light, Inc.
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

#![allow(clippy::expect_used)]
#![allow(clippy::unwrap_used)]

use ethers::types::{Address, Bytes};
use eyre::Result;
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::types::{
    EstimateResult, GasAndPaymasterAndData, PaymasterAndData, UserOperationConstruct,
    UserOperationRequest,
};
use lightdotso_db::{
    db::create_client,
    models::{
        billing_operation::create_billing_operation,
        paymaster_operation::create_paymaster_operation,
    },
};
use lightdotso_gas::types::GasEstimation;
use lightdotso_jsonrpsee::{
    error::JsonRpcError,
    handle_response,
    types::{Request, Response},
};
use lightdotso_prisma::paymaster_operation;
use lightdotso_rpc::constants::PIMLICO_RPC_URLS;
use lightdotso_tracing::tracing::{info, warn};
use serde_json::{json, Value};

use crate::constants::{PIMLICO_BASE_URL, PIMLICO_SPONSORSHIP_POLICIES};

/// The paymaster api implementation.
pub(crate) struct PaymasterApi {}

// Retryable sponsorship fetch function.
pub async fn fetch_user_operation_sponsorship(
    user_operation: UserOperationConstruct,
    entry_point: Address,
    chain_id: u64,
) -> Result<GasAndPaymasterAndData> {
    // Get the environment variable, `PIMLICO_API_KEY`.
    let pimlico_api_key =
        std::env::var("PIMLICO_API_KEY").map_err(|_| eyre::eyre!("PIMLICO_API_KEY not set"))?;

    // Check if the `chain_id` is one of the key of `PIMLICO_RPC_URLS`.
    if (*PIMLICO_RPC_URLS).contains_key(&chain_id) {
        // For each paymaster policy, attempt to fetch the user operation sponsorship.
        for policy in PIMLICO_SPONSORSHIP_POLICIES.iter() {
            info!("pimlico policy: {:?}", policy);

            let sponsorship = get_user_operation_sponsorship(
                format!("{}/{}/rpc?apiKey={}", *PIMLICO_BASE_URL, chain_id, pimlico_api_key),
                entry_point,
                &user_operation,
                json!({
                    "sponsorshipPolicy": policy
                }),
            )
            .await
            .map_err(JsonRpcError::from);

            // If the sponsorship is successful, return the result.
            if let Ok(sponsorship_data) = sponsorship {
                return Ok(sponsorship_data.result);
            }
        }
    }

    // If the sponsorship is not successful, return error.
    Err(eyre::eyre!("Failed to fetch user operation sponsorship"))
}

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

        // Get the paymaster operation sponsor.
        let uop_sponsorship = fetch_user_operation_sponsorship(construct, entry_point, chain_id)
            .await
            .map_err(JsonRpcError::from)?;

        // // Finally, create the paymaster operation.
        // let op = db_create_paymaster_operation(
        //     chain_id,
        //     uop_sponsorship.result.paymaster_address,
        //     construct.sender,
        //     paymaster_nonce,
        //     valid_until,
        //     valid_after,
        // )
        // .await
        // .map_err(JsonRpcError::from)?;

        // // Before exit, create the billing operation.
        // db_create_billing_operation(construct.sender, op.id.clone())
        //     .await
        //     .map_err(JsonRpcError::from)?;

        Ok(uop_sponsorship)
    }
}

pub async fn db_create_billing_operation(
    sender_address: Address,
    paymaster_operation_id: String,
) -> Result<()> {
    // Create the client.
    let client = create_client().await?;

    // Create the billing operation.
    create_billing_operation(client.into(), sender_address, paymaster_operation_id).await?;

    Ok(())
}

pub async fn db_create_paymaster_operation(
    chain_id: u64,
    paymaster_address: Address,
    sender_address: Address,
    sender_nonce: u64,
    valid_until: u64,
    valid_after: u64,
) -> Result<paymaster_operation::Data> {
    // Create the client.
    let client = create_client().await?;

    // Create the paymaster operation.
    let (_, op) = create_paymaster_operation(
        client.into(),
        chain_id as i64,
        paymaster_address,
        sender_address,
        sender_nonce as i64,
        valid_until as i64,
        valid_after as i64,
    )
    .await?;

    Ok(op)
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

pub async fn get_user_operation_sponsorship(
    rpc_url: String,
    entry_point: Address,
    user_operation_construct: &UserOperationConstruct,
    sponsorship_policy: Value,
) -> Result<Response<GasAndPaymasterAndData>> {
    let user_operation = UserOperationRequest {
        call_data: user_operation_construct.call_data.clone(),
        init_code: user_operation_construct.init_code.clone(),
        nonce: user_operation_construct.nonce,
        sender: user_operation_construct.sender,
        pre_verification_gas: Some(user_operation_construct.pre_verification_gas),
        verification_gas_limit: Some(user_operation_construct.verification_gas_limit),
        call_gas_limit: Some(user_operation_construct.call_gas_limit),
        max_fee_per_gas: Some(user_operation_construct.max_fee_per_gas),
        max_priority_fee_per_gas: Some(user_operation_construct.max_priority_fee_per_gas),
        paymaster_and_data: Some(Bytes::default()),
        signature: Bytes::default(),
    };

    let params = vec![json!(user_operation), json!(entry_point), sponsorship_policy];
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
