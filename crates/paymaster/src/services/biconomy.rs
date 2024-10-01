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

use eyre::Result;
use lightdotso_contracts::types::{BiconomyGasAndPaymasterAndData, UserOperationRequest};
use lightdotso_jsonrpsee::{
    handle_response,
    types::{Request, Response},
};
use lightdotso_tracing::tracing::info;
use serde_json::json;

// -----------------------------------------------------------------------------
// Services
// -----------------------------------------------------------------------------

/// Get the paymaster and data from the biconomy.
pub async fn get_biconomy_paymaster_and_data(
    rpc_url: String,
    user_operation: &UserOperationRequest,
) -> Result<Response<BiconomyGasAndPaymasterAndData>> {
    let params = vec![json!([user_operation, {
        "mode": "SPONSORED",
        "calculateGasLimits": true,
        "expiryDuration": 300,
        "sponsorshipInfo": {
          "webhookData": {},
          "smartAccountInfo": {
            "name": "LIGHT",
            "version": "0.3.0"
          }
        }
    }])];
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
