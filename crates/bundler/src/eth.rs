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
    constants::ENTRYPOINT_ADDRESSES,
    errors::{EthResult, EthRpcError},
    provider::get_provider,
    types::RichUserOperation,
};
use anyhow::Context;
use ethers::{
    abi::AbiDecode,
    contract::EthEvent,
    middleware::Middleware,
    providers::{Http, Provider},
    types::{
        Address, BlockNumber, Bytes, Filter, GethDebugBuiltInTracerType, GethDebugTracerType,
        GethDebugTracingOptions, GethTrace, GethTraceFrame, Log, H256, U256, U64,
    },
    utils::to_checksum,
};
use jsonrpsee::core::RpcResult;
use rundler_sim::{
    GasEstimate, GasEstimationError, GasEstimator, GasEstimatorImpl, UserOperationOptionalGas,
};
use rundler_types::{
    contracts::i_entry_point::{IEntryPoint, IEntryPointCalls, UserOperationEventFilter},
    UserOperation,
};
use rundler_utils::log::LogOnError;
use std::{
    collections::{HashMap, VecDeque},
    sync::Arc,
};

/// The eth server implementation.
pub(crate) struct EthApi {}

impl EthApi {
    pub(crate) async fn chain_id(&self, chain_id: u64) -> RpcResult<U64> {
        Ok(chain_id.into())
    }

    pub(crate) async fn supported_entry_points(&self, _chain_id: u64) -> RpcResult<Vec<String>> {
        Ok(ENTRYPOINT_ADDRESSES.into_iter().map(|ep| to_checksum(&ep, None)).collect())
    }

    pub(crate) async fn estimate_user_operation_gas(
        &self,
        op: UserOperationOptionalGas,
        entry_point: Address,
        chain_id: u64,
    ) -> EthResult<GasEstimate> {
        // Get the provider for the chain id.
        let provider = self.get_eth_provider(chain_id).await?;

        // If the entry point is not in the list of known entry points, return an error.
        let entry_points = self.get_entrypoints(provider.clone().into());

        // If the entry point is not in the list of known entry points, return an error.
        let entry_point = entry_points.get(&entry_point).ok_or_else(|| {
            EthRpcError::InvalidParams(
                "supplied entry_point address is not a known entry point".to_string(),
            )
        })?;

        let gas_estimator = GasEstimatorImpl::new(
            chain_id,
            Arc::new(provider.clone()),
            entry_point.clone(),
            rundler_sim::EstimationSettings {
                max_verification_gas: 5000000,
                // https://github.com/alchemyplatform/rundler/blob/22fc250166cf525596faa9db84f5f56ca945a40b/bin/rundler/src/cli/mod.rs#L257
                max_call_gas: 20000000 - 5000000,
                max_simulate_handle_ops_gas: 20000000,
            },
        );

        let result = gas_estimator.estimate_op_gas(op).await;
        match result {
            Ok(estimate) => Ok(estimate),
            Err(GasEstimationError::RevertInValidation(message)) => {
                Err(EthRpcError::EntryPointValidationRejected(message))?
            }
            Err(GasEstimationError::RevertInCallWithMessage(message)) => {
                Err(EthRpcError::ExecutionReverted(message))?
            }
            Err(error @ GasEstimationError::RevertInCallWithBytes(_)) => {
                Err(EthRpcError::ExecutionReverted(error.to_string()))?
            }
            Err(GasEstimationError::Other(error)) => {
                // FIX:: Temporary solution to get the error message
                Err(EthRpcError::ExecutionReverted(error.to_string()))?
            }
        }
    }

    pub(crate) async fn get_user_operation_by_hash(
        &self,
        hash: H256,
        chain_id: u64,
    ) -> EthResult<Option<RichUserOperation>> {
        // Get the provider for the chain id.
        let provider = self.get_eth_provider(chain_id).await?;

        // If the entry point is not in the list of known entry points, return an error.
        let entry_points = self.get_entrypoints(provider.clone().into());

        if hash == H256::zero() {
            return Err(EthRpcError::InvalidParams("Missing/invalid userOpHash".to_string()));
        }

        // Get event associated with hash (need to check all entry point addresses associated with
        // this API)
        let event = self
            .get_user_operation_event_by_hash(Arc::new(provider.clone()), hash)
            .await
            .log_on_error("should have successfully queried for user op events by hash")?;

        let Some(event) = event else { return Ok(None) };

        // If the event is found, get the TX and entry point
        let transaction_hash = event.transaction_hash.context("tx_hash should be present")?;

        let tx = provider
            .get_transaction(transaction_hash)
            .await
            .context("should have fetched tx from provider")?
            .context("should have found tx")?;

        // We should return null if the tx isn't included in the block yet
        if tx.block_hash.is_none() && tx.block_number.is_none() {
            return Ok(None);
        }
        let to = tx
            .to
            .context("tx.to should be present on transaction containing user operation event")?;

        // Find first op matching the hash
        let user_operation = if entry_points.contains_key(&to) {
            self.get_user_operations_from_tx_data(tx.input)
                .into_iter()
                .find(|op| op.op_hash(to, chain_id) == hash)
                .context("matching user operation should be found in tx data")?
        } else {
            self.trace_find_user_operation(
                Arc::new(provider.clone()),
                transaction_hash,
                hash,
                chain_id,
            )
            .await
            .context("error running trace")?
            .context("should have found user operation in trace")?
        };

        Ok(Some(RichUserOperation {
            user_operation: user_operation.into(),
            entry_point: event.address.into(),
            block_number: tx.block_number.map(|n| U256::from(n.as_u64())).unwrap_or_default(),
            block_hash: tx.block_hash.unwrap_or_default(),
            transaction_hash,
        }))
    }

    async fn get_user_operation_event_by_hash(
        &self,
        provider: Arc<ethers::providers::Provider<Http>>,
        hash: H256,
    ) -> EthResult<Option<Log>> {
        let to_block = provider.get_block_number().await?;

        let filter = Filter::new()
            .address::<Vec<Address>>(ENTRYPOINT_ADDRESSES.to_vec())
            .event(&UserOperationEventFilter::abi_signature())
            .from_block(BlockNumber::Earliest)
            .to_block(to_block)
            .topic1(hash);

        let logs = provider.get_logs(&filter).await?;
        Ok(logs.into_iter().next())
    }

    /// This method takes a transaction hash and a user operation hash and returns the full user
    /// operation if it exists. This is meant to be used when a user operation event is found in
    /// the logs of a transaction, but the top level call wasn't to an entrypoint, so we need to
    /// trace the transaction to find the user operation by inspecting each call frame
    /// and returning the user operation that matches the hash.
    async fn trace_find_user_operation(
        &self,
        provider: Arc<ethers::providers::Provider<Http>>,
        tx_hash: H256,
        user_op_hash: H256,
        chain_id: u64,
    ) -> EthResult<Option<UserOperation>> {
        // initial call wasn't to an entrypoint, so we need to trace the transaction to find the
        // user operation
        let trace_options = GethDebugTracingOptions {
            tracer: Some(GethDebugTracerType::BuiltInTracer(
                GethDebugBuiltInTracerType::CallTracer,
            )),
            ..Default::default()
        };
        let trace = provider
            .debug_trace_transaction(tx_hash, trace_options)
            .await
            .context("should have fetched trace from provider")?;

        // breadth first search for the user operation in the trace
        let mut frame_queue = VecDeque::new();

        if let GethTrace::Known(GethTraceFrame::CallTracer(call_frame)) = trace {
            frame_queue.push_back(call_frame);
        }

        while let Some(call_frame) = frame_queue.pop_front() {
            // check if the call is to an entrypoint, if not enqueue the child calls if any
            if let Some(to) = call_frame
                .to
                .as_ref()
                .and_then(|to| to.as_address())
                .filter(|to| self.get_entrypoints(provider.clone()).contains_key(to))
            {
                // check if the user operation is in the call frame
                if let Some(uo) = self
                    .get_user_operations_from_tx_data(call_frame.input)
                    .into_iter()
                    .find(|op| op.op_hash(*to, chain_id) == user_op_hash)
                {
                    return Ok(Some(uo));
                }
            } else if let Some(calls) = call_frame.calls {
                frame_queue.extend(calls)
            }
        }

        Ok(None)
    }

    fn get_user_operations_from_tx_data(&self, tx_data: Bytes) -> Vec<UserOperation> {
        let entry_point_calls = match IEntryPointCalls::decode(tx_data) {
            Ok(entry_point_calls) => entry_point_calls,
            Err(_) => return vec![],
        };

        match entry_point_calls {
            IEntryPointCalls::HandleOps(handle_ops_call) => handle_ops_call.ops,
            IEntryPointCalls::HandleAggregatedOps(handle_aggregated_ops_call) => {
                handle_aggregated_ops_call
                    .ops_per_aggregator
                    .into_iter()
                    .flat_map(|ops| ops.user_ops)
                    .collect()
            }
            _ => vec![],
        }
    }

    async fn get_eth_provider(
        &self,
        chain_id: u64,
    ) -> EthResult<ethers::providers::Provider<Http>> {
        let provider = get_provider(chain_id).await?;
        Ok(provider)
    }

    fn get_entrypoints(
        &self,
        provider: Arc<ethers::providers::Provider<Http>>,
    ) -> HashMap<Address, IEntryPoint<Arc<Provider<Http>>>> {
        ENTRYPOINT_ADDRESSES
            .iter()
            .map(|addr| (*addr, IEntryPoint::new(*addr, Arc::new(provider.clone()))))
            .collect::<HashMap<_, _>>()
    }
}
