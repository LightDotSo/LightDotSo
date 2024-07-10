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

use crate::config::NodeArgs;
use ethers::types::{Address, H256};
use eyre::Result;
use lightdotso_contracts::types::UserOperation;
use lightdotso_jsonrpsee::{
    handle_response,
    types::{Request, Response},
};
use lightdotso_tracing::tracing::info;
use serde_json::json;

#[derive(Clone)]
pub struct Node {}

impl Node {
    pub async fn new(_args: &NodeArgs) -> Self {
        info!("Node new, starting");

        // Create the node
        Self {}
    }

    pub async fn run(&self) {
        info!("Node run, starting");
    }

    /// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/userop_middleware.rs#L128
    /// License: MIT
    pub async fn send_user_operation(
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<Response<H256>> {
        let params = vec![json!(user_operation), json!(entry_point)];
        info!("params: {:?}", params);

        let req_body = Request {
            jsonrpc: "2.0".to_string(),
            method: "eth_sendUserOperation".to_string(),
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
}
