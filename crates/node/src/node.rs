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
use alloy::{
    eips::{BlockId, BlockNumberOrTag},
    network::{EthereumWallet, TransactionBuilder, TxSigner},
    primitives::{Address, Bytes, B256},
    providers::{ext::DebugApi, Provider},
    rpc::types::trace::geth::{
        GethDebugTracerConfig, GethDebugTracerType, GethDebugTracingCallOptions,
        GethDebugTracingOptions, GethDefaultTracingOptions,
    },
    signers::aws::AwsSigner,
};
use backon::{ExponentialBuilder, Retryable};
use eyre::{eyre, ContextCompat, Result};
use lightdotso_contracts::{
    address::{
        ENTRYPOINT_V060_ADDRESS, ENTRYPOINT_V070_ADDRESS, LIGHT_OFFCHAIN_VERIFIER_ADDRESSES,
    },
    entrypoint_v060::get_entrypoint_v060,
    entrypoint_v070::get_entrypoint_v070,
    provider::{get_provider, get_provider_with_wallet},
    tracer::{ExecutorTracerResult, EXECUTOR_TRACER},
    types::{PackedUserOperation, UserOperation},
};
use lightdotso_jsonrpsee::{
    handle_response,
    types::{Request, Response},
};
use lightdotso_signer::connect::connect_to_kms;
use lightdotso_tracing::tracing::info;
use serde_json::json;

#[derive(Clone)]
pub struct Node {
    signer: Option<AwsSigner>,
    signer_address: Option<Address>,
}

impl Node {
    pub async fn new(_args: &NodeArgs) -> Result<Self> {
        info!("Node new, starting");

        // Connect to KMS
        let signer = connect_to_kms().await?;

        // Check if the address matches one of the offchain verifier address
        let signer_address = signer.address();

        // Log the address
        info!("node signer address: {:?}", signer_address);

        // Return an error if the address is not one of the offchain verifier addresses
        if !LIGHT_OFFCHAIN_VERIFIER_ADDRESSES.contains(&signer_address) {
            return Err(eyre!("Address is not one of the offchain verifier addresses"));
        }

        // Create the node
        Ok(Self { signer: Some(signer), signer_address: Some(signer_address) })
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
            simulate_user_operation.retry(ExponentialBuilder::default().with_max_times(1)).await;
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
        let entrypoint = get_entrypoint_v060(chain_id, entry_point).await?;

        // Simulate the user operation w/ `eth_call`
        let res = entrypoint
            .simulateHandleOp(user_operation.clone().into(), Address::ZERO, vec![].into())
            .call_raw()
            .await
            .err()
            .context("simulate_handle_op should fail")?;
        info!("res: {:?}", res);

        // Decode the revert reason
        // let error_data = get_revert_bytes(res)?;
        // info!("error_data: {:?}", error_data);

        // Decode the execution result
        // let reason = decode_simulate_handle_ops_revert(error_data).map_err(|e| eyre!(e))?;
        // info!("execution_result: {:?}", reason);

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
            .retry(ExponentialBuilder::default().with_max_times(1))
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
        let entrypoint = get_entrypoint_v060(chain_id, entry_point).await?;

        // From: https://github.com/silius-rs/silius/blob/f695b54cbbabf6b3f22f7af8918a2d6d83ca8960/crates/contracts/src/entry_point.rs#L139-L175
        // License: Apache-2.0

        // Debug trace call
        let call = entrypoint.simulateHandleOp(
            user_operation.clone().into(),
            Address::ZERO,
            Bytes::default(),
        );
        let tx = call.into_transaction_request();
        // tx.(Address::ZERO);
        // tx(user_operation.clone().max_fee_per_gas);
        // tx.set_gas(u64::MAX);

        // Get provider
        let (provider, _) = get_provider(chain_id).await?;

        // Get the geth trace
        let trace = provider
            .debug_trace_call(
                tx,
                BlockId::Number(BlockNumberOrTag::Latest),
                GethDebugTracingCallOptions::default().with_tracing_options(
                    GethDebugTracingOptions {
                        config: GethDefaultTracingOptions::default(),
                        tracer: Some(GethDebugTracerType::JsTracer(EXECUTOR_TRACER.into())),
                        tracer_config: GethDebugTracerConfig::default(),
                        timeout: None,
                    },
                ),
            )
            .await
            .map_err(|e| eyre!("Failed to debug trace call: {:?}", e))?;

        let tracer_result: ExecutorTracerResult =
            ExecutorTracerResult::try_from(trace).map_err(|e| eyre!(e))?;
        info!("tracer_result: {:?}", tracer_result);

        // let user_op_revert_event = tracer_result
        //     .user_op_revert_event
        //     .as_ref()
        //     .and_then(|e| parse_user_op_event::<UserOperationRevertReason>(e).ok());
        // info!("user_op_revert_event: {:?}", user_op_revert_event);

        // let user_op_event = tracer_result
        //     .user_op_event
        //     .as_ref()
        //     .ok_or(eyre!("Estimate trace simulate handle op user op event not found"))?;
        // let user_op_event = parse_user_op_event::<UserOperationRevertReason>(user_op_event)?;
        // info!("user_op_event: {:?}", user_op_event);

        // Ok(user_op_event.success)

        Ok(true)
    }

    pub async fn send_user_operation_with_backon(
        &self,
        chain_id: u64,
        entry_point: Address,
        user_operation: &UserOperation,
    ) -> Result<Response<B256>> {
        // Send the user operation to the node
        let send_user_operation =
            || async { self.send_user_operation(chain_id, entry_point, user_operation).await };

        // Retry the request 5 times
        let res = send_user_operation.retry(ExponentialBuilder::default().with_max_times(5)).await;
        info!("res: {:?}", res);

        res
    }

    pub async fn send_raw_user_operation_with_backon(
        &self,
        chain_id: u64,
        user_operation: &UserOperation,
    ) -> Result<B256> {
        // Send the raw user operation to the node
        let send_raw_user_operation =
            || async { self.raw_send_user_operation(chain_id, user_operation).await };

        // Retry the request 5 times
        let res =
            send_raw_user_operation.retry(ExponentialBuilder::default().with_max_times(5)).await;
        info!("res: {:?}", res);

        res
    }

    pub async fn send_packed_user_operation_with_backon(
        &self,
        chain_id: u64,
        entry_point: Address,
        packed_user_operation: &PackedUserOperation,
    ) -> Result<Response<B256>> {
        // Send the packed user operation to the node
        let send_packed_user_operation = || async {
            self.send_packed_user_operation(chain_id, entry_point, packed_user_operation).await
        };

        // Retry the request 5 times
        let res =
            send_packed_user_operation.retry(ExponentialBuilder::default().with_max_times(5)).await;
        info!("res: {:?}", res);

        res
    }

    pub async fn send_raw_packed_user_operation_with_backon(
        &self,
        chain_id: u64,
        packed_user_operation: &PackedUserOperation,
    ) -> Result<B256> {
        // Send the raw packed user operation to the node
        let send_raw_packed_user_operation =
            || async { self.raw_send_packed_user_operation(chain_id, packed_user_operation).await };

        // Retry the request 5 times
        let res = send_raw_packed_user_operation
            .retry(ExponentialBuilder::default().with_max_times(5))
            .await;
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
    ) -> Result<Response<B256>> {
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

    pub async fn raw_send_user_operation(
        &self,
        chain_id: u64,
        user_operation: &UserOperation,
    ) -> Result<B256> {
        // Get the entrypoint
        let entry_point = get_entrypoint_v060(chain_id, *ENTRYPOINT_V060_ADDRESS).await?;

        // Get signer
        let signer = self.signer.clone().ok_or(eyre!("Signer not found"))?;

        // Get signer address
        let signer_address =
            self.signer_address.clone().ok_or(eyre!("Signer address not found"))?;

        // Get the wallet
        let wallet = EthereumWallet::from(signer);

        // Get the provider with the wallet
        let (provider, _) = get_provider_with_wallet(chain_id, wallet).await?;

        // Set the transaction request
        let tx_request = entry_point
            .handleOps(vec![user_operation.clone().into()], signer_address)
            .into_transaction_request();

        // Set the transaction
        let tx = tx_request.with_chain_id(chain_id);

        // Send the transaction
        let builder = provider.send_transaction(tx).await?;
        let node_hash = *builder.tx_hash();

        // Wait for the transaction to be included and get the receipt.
        let receipt = builder.get_receipt().await?;

        info!("receipt: {:?}", receipt);

        Ok(node_hash)
    }

    pub async fn send_packed_user_operation(
        &self,
        chain_id: u64,
        entry_point: Address,
        packed_user_operation: &PackedUserOperation,
    ) -> Result<Response<B256>> {
        let params = vec![json!(packed_user_operation.clone()), json!(entry_point)];
        info!("params: {:?}", params);

        let req_body = Request {
            jsonrpc: "2.0".to_string(),
            method: "eth_sendUserOperation".to_string(),
            params: params.clone(),
            id: 1,
        };

        // Log the time before sending the user operation to the node
        info!(
            "Sending packed user operation {:?} to the node at {}",
            packed_user_operation.clone(),
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

    pub async fn raw_send_packed_user_operation(
        &self,
        chain_id: u64,
        packed_user_operation: &PackedUserOperation,
    ) -> Result<B256> {
        // Get the entrypoint
        let entry_point = get_entrypoint_v070(chain_id, *ENTRYPOINT_V070_ADDRESS).await?;

        // Get signer
        let signer = self.signer.clone().ok_or(eyre!("Signer not found"))?;

        // Get signer address
        let signer_address =
            self.signer_address.clone().ok_or(eyre!("Signer address not found"))?;

        // Get the wallet
        let wallet = EthereumWallet::from(signer);

        // Get the provider with the wallet
        let (provider, _) = get_provider_with_wallet(chain_id, wallet).await?;

        // Set the transaction request
        let tx_request = entry_point
            .handleOps(vec![packed_user_operation.clone().into()], signer_address)
            .into_transaction_request();

        // Set the transaction
        let tx = tx_request.with_chain_id(chain_id);

        // Send the transaction
        let builder = provider.send_transaction(tx).await?;
        let node_hash = *builder.tx_hash();

        // Wait for the transaction to be included and get the receipt.
        let receipt = builder.get_receipt().await?;

        info!("receipt: {:?}", receipt);

        Ok(node_hash)
    }
}
