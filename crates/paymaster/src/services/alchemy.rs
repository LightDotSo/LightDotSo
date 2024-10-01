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

use alloy::primitives::Address;
use eyre::Result;
use lightdotso_contracts::types::{
    AlchemyGasAndPaymasterAndData, AlchemyPackedGasAndPaymasterAndData, PackedUserOperationRequest,
    UserOperationRequest,
};
use lightdotso_jsonrpsee::{
    handle_response,
    types::{Request, Response},
};
use lightdotso_tracing::tracing::info;
use serde_json::json;

// -----------------------------------------------------------------------------
// Services
// -----------------------------------------------------------------------------

/// Get the paymaster and data from the alchemy.
pub async fn get_alchemy_paymaster_and_data(
    rpc_url: String,
    entry_point: Address,
    user_operation: &UserOperationRequest,
    policy_id: String,
) -> Result<Response<AlchemyGasAndPaymasterAndData>> {
    let params = vec![
        json!({"policyId": policy_id, "entryPoint": entry_point, "userOperation": user_operation}),
    ];
    info!("params: {:?}", params);

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "alchemy_requestGasAndPaymasterAndData".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response = client.post(rpc_url).json(&req_body).send().await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
}

/// Get the packed paymaster and data from the alchemy.
pub async fn get_packed_alchemy_paymaster_and_data(
    rpc_url: String,
    entry_point: Address,
    packed_user_operation: &PackedUserOperationRequest,
    policy_id: String,
) -> Result<Response<AlchemyPackedGasAndPaymasterAndData>> {
    let params = vec![
        json!({"policyId": policy_id, "entryPoint": entry_point, "userOperation": packed_user_operation}),
    ];
    info!("params: {:?}", params);

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "alchemy_requestGasAndPaymasterAndData".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response = client.post(rpc_url).json(&req_body).send().await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
}
