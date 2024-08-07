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

// Copyright 2023-2024 Silius Contributors.
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
use backon::{ExponentialBuilder, Retryable};
use ethers::{
    providers::Middleware,
    types::{
        spoof, transaction::eip2718::TypedTransaction, Address, BlockNumber, Bytes,
        GethDebugTracerType, GethDebugTracingCallOptions, GethDebugTracingOptions, H256,
    },
};
use eyre::{eyre, ContextCompat, Result};
use lightdotso_contracts::{
    entrypoint::{get_entrypoint, UserOperationEventFilter, UserOperationRevertReasonFilter},
    provider::get_provider,
    tracer::{ExecutorTracerResult, EXECUTOR_TRACER},
    types::UserOperation,
    user_operation::parse_user_op_event,
    utils::{decode_simulate_handle_ops_revert, get_revert_bytes},
};
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

    pub async fn simulate_user_operation_with_backon(
        &self,
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<()> {
        let simulate_user_operation =
            || async { self.simulate_user_operation(chain_id, entry_point, user_operation).await };

        let res =
            simulate_user_operation.retry(&ExponentialBuilder::default().with_max_times(1)).await;
        info!("res: {:?}", res);

        Ok(())
    }

    /// Simulate a user operation on the node w/ `eth_call`
    /// Note that this function will always return an error because the call will revert on-chain
    /// Only for EntryPoint v0.6.0
    pub async fn simulate_user_operation(
        &self,
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<()> {
        let entrypoint = get_entrypoint(chain_id, entry_point).await?;

        // Simulate the user operation w/ `eth_call`
        let res = entrypoint
            .simulate_handle_op(user_operation.clone().into(), Address::zero(), vec![].into())
            .call_raw()
            .await
            .err()
            .context("simulate_handle_op should fail")?;
        info!("res: {:?}", res);

        // Decode the revert reason
        let error_data = get_revert_bytes(res)?;
        info!("error_data: {:?}", error_data);

        // Decode the execution result
        let reason = decode_simulate_handle_ops_revert(error_data).map_err(|e| eyre!(e))?;
        info!("execution_result: {:?}", reason);

        Ok(())
    }

    pub async fn simulate_user_operation_with_tracer_with_backon(
        &self,
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<bool> {
        let simulate_user_operation_with_tracer = || async {
            self.simulate_user_operation_with_tracer(chain_id, entry_point, user_operation).await
        };

        let res = simulate_user_operation_with_tracer
            .retry(&ExponentialBuilder::default().with_max_times(1))
            .await;
        info!("res: {:?}", res);

        res
    }

    // From: https://github.com/silius-rs/silius/blob/62cff148f386283bc44114ec9d545eae427489f2/crates/mempool/src/estimate.rs#L116-129
    // License: Apache-2.0

    /// Simulate a user operation on the node w/ `debug_traceCall`
    /// Only for EntryPoint v0.6.0
    /// Parses the user operation event and the user operation revert event from the trace for next.
    pub async fn simulate_user_operation_with_tracer(
        &self,
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<bool> {
        // Get the entrypoint
        let entrypoint = get_entrypoint(chain_id, entry_point).await?;

        // From: https://github.com/silius-rs/silius/blob/f695b54cbbabf6b3f22f7af8918a2d6d83ca8960/crates/contracts/src/entry_point.rs#L139-L175
        // License: Apache-2.0

        // Debug trace call
        let call = entrypoint.simulate_handle_op(
            user_operation.clone().into(),
            Address::zero(),
            Bytes::default(),
        );
        let mut tx: TypedTransaction = call.tx;
        tx.set_from(Address::zero());
        tx.set_gas_price(user_operation.clone().max_fee_per_gas);
        tx.set_gas(u64::MAX);

        // Get provider
        let provider = get_provider(chain_id).await?;

        // Get the geth trace
        let trace = provider
            .debug_trace_call(
                tx,
                Some(BlockNumber::Latest.into()),
                GethDebugTracingCallOptions {
                    tracing_options: GethDebugTracingOptions {
                        disable_storage: None,
                        disable_stack: None,
                        enable_memory: None,
                        enable_return_data: None,
                        tracer: Some(GethDebugTracerType::JsTracer(EXECUTOR_TRACER.into())),
                        tracer_config: None,
                        timeout: None,
                    },
                    state_overrides: Some(spoof::balance(
                        Address::zero(),
                        // Maximum uint96 value
                        // From: https://github.com/silius-rs/silius/blob/f695b54cbbabf6b3f22f7af8918a2d6d83ca8960/crates/contracts/src/entry_point.rs#L29C26-L29C60
                        // License: Apache-2.0
                        5192296858534827628530496329220095_u128.into(),
                    )),
                },
            )
            .await
            .map_err(|e| eyre!("Failed to debug trace call: {:?}", e))?;

        let tracer_result: ExecutorTracerResult =
            ExecutorTracerResult::try_from(trace).map_err(|e| eyre!(e))?;
        info!("tracer_result: {:?}", tracer_result);

        let user_op_revert_event = tracer_result
            .user_op_revert_event
            .as_ref()
            .and_then(|e| parse_user_op_event::<UserOperationRevertReasonFilter>(e).ok());
        info!("user_op_revert_event: {:?}", user_op_revert_event);

        let user_op_event = tracer_result
            .user_op_event
            .as_ref()
            .ok_or(eyre!("Estimate trace simulate handle op user op event not found"))?;
        let user_op_event = parse_user_op_event::<UserOperationEventFilter>(user_op_event)?;
        info!("user_op_event: {:?}", user_op_event);

        Ok(user_op_event.success)
    }

    pub async fn send_user_operation_with_backon(
        &self,
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<Response<H256>> {
        let send_user_operation =
            || async { self.send_user_operation(chain_id, entry_point, user_operation).await };

        let res = send_user_operation.retry(&ExponentialBuilder::default().with_max_times(5)).await;
        info!("res: {:?}", res);

        res
    }

    /// Send a user operation to the node
    /// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/userop_middleware.rs#L128
    /// License: MIT
    pub async fn send_user_operation(
        &self,
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<Response<H256>> {
        let params = vec![json!(user_operation.clone()), json!(entry_point)];
        info!("params: {:?}", params);

        let req_body = Request {
            jsonrpc: "2.0".to_string(),
            method: "eth_sendUserOperation".to_string(),
            params: params.clone(),
            id: 1,
        };

        // Log the time before sending the user operation to the node
        info!(
            "Sending user operation {:?} to the node at {}",
            user_operation.clone(),
            chrono::Utc::now()
        );

        // Send the user operation to the node
        let client = reqwest::Client::new();

        let response = client
            .post(format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", chain_id))
            .json(&req_body)
            .send()
            .await?;

        // Handle the response for the JSON-RPC API.
        let res = handle_response(response).await?;

        Ok(res)
    }
}
