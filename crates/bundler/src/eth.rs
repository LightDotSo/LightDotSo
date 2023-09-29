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
    types::{RichUserOperation, UserOperationReceipt},
};
use anyhow::Context;
use ethers::{
    abi::{AbiDecode, RawLog},
    contract::EthEvent,
    middleware::Middleware,
    providers::{Http, Provider},
    types::{
        Address, BlockNumber, Bytes, Filter, GethDebugBuiltInTracerType, GethDebugTracerType,
        GethDebugTracingOptions, GethTrace, GethTraceFrame, Log, TransactionReceipt, H256, U256,
        U64,
    },
    utils::to_checksum,
};
use jsonrpsee::core::RpcResult;
use rundler_sim::{
    GasEstimate, GasEstimationError, GasEstimator, GasEstimatorImpl, UserOperationOptionalGas,
};
use rundler_types::{
    contracts::{
        entry_point::UserOperationRevertReasonFilter,
        i_entry_point::{IEntryPoint, IEntryPointCalls, UserOperationEventFilter},
    },
    UserOperation,
};
use rundler_utils::{eth::log_to_raw_log, log::LogOnError};
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

    pub(crate) async fn get_user_operation_receipt(
        &self,
        hash: H256,
        chain_id: u64,
    ) -> EthResult<Option<UserOperationReceipt>> {
        if hash == H256::zero() {
            return Err(EthRpcError::InvalidParams("Missing/invalid userOpHash".to_string()));
        }

        // Get the provider for the chain id.
        let provider = self.get_eth_provider(chain_id).await?;

        // Get event associated with hash (need to check all entry point addresses associated with
        // this API)
        let log = self
            .get_user_operation_event_by_hash(Arc::new(provider.clone()), hash)
            .await
            .context("should have fetched user ops by hash")?;

        let Some(log) = log else { return Ok(None) };
        let entry_point = log.address;

        // If the event is found, get the TX receipt
        let tx_hash = log.transaction_hash.context("tx_hash should be present")?;
        let tx_receipt = provider
            .get_transaction_receipt(tx_hash)
            .await
            .context("should have fetched tx receipt")?
            .context("Failed to fetch tx receipt")?;

        // Return null if the tx isn't included in the block yet
        if tx_receipt.block_hash.is_none() && tx_receipt.block_number.is_none() {
            return Ok(None);
        }

        // Filter receipt logs to match just those belonging to the user op
        let filtered_logs = self
            .filter_receipt_logs_matching_user_op(&log, &tx_receipt)
            .context("should have found receipt logs matching user op")?;

        // Decode log and find failure reason if not success
        let uo_event = self
            .decode_user_operation_event(log)
            .context("should have decoded user operation event")?;
        let reason: String = if uo_event.success {
            "".to_owned()
        } else {
            self.get_user_operation_failure_reason(&tx_receipt.logs, hash)
                .context("should have found revert reason if tx wasn't successful")?
                .unwrap_or_default()
        };

        Ok(Some(UserOperationReceipt {
            user_op_hash: hash,
            entry_point: entry_point.into(),
            sender: uo_event.sender.into(),
            nonce: uo_event.nonce,
            paymaster: uo_event.paymaster.into(),
            actual_gas_cost: uo_event.actual_gas_cost,
            actual_gas_used: uo_event.actual_gas_used,
            success: uo_event.success,
            logs: filtered_logs,
            receipt: tx_receipt,
            reason,
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

    fn decode_user_operation_event(&self, log: Log) -> EthResult<UserOperationEventFilter> {
        Ok(UserOperationEventFilter::decode_log(&log_to_raw_log(log))
            .context("log should be a user operation event")?)
    }

    /// This method takes a user operation event and a transaction receipt and filters out all the
    /// logs relevant to the user operation. Since there are potentially many user operations in
    /// a transaction, we want to find all the logs (including the user operation event itself)
    /// that are sandwiched between ours and the one before it that wasn't ours.
    /// eg. reference_log: UserOp(hash_moldy) logs: \[...OtherLogs, UserOp(hash1), ...OtherLogs,
    /// UserOp(hash_moldy), ...OtherLogs\] -> logs: logs\[(idx_of_UserOp(hash1) +
    /// 1)..=idx_of_UserOp(hash_moldy)\]
    ///
    /// topic\[0\] == event name
    /// topic\[1\] == user operation hash
    ///
    /// NOTE: we can't convert just decode all the logs as user operations and filter because we
    /// still want all the other log types
    fn filter_receipt_logs_matching_user_op(
        &self,
        reference_log: &Log,
        tx_receipt: &TransactionReceipt,
    ) -> EthResult<Vec<Log>> {
        let mut start_idx = 0;
        let mut end_idx = tx_receipt.logs.len() - 1;
        let logs = &tx_receipt.logs;

        let is_ref_user_op = |log: &Log| {
            log.topics[0] == reference_log.topics[0] &&
                log.topics[1] == reference_log.topics[1] &&
                log.address == reference_log.address
        };

        let is_user_op_event = |log: &Log| log.topics[0] == reference_log.topics[0];

        let mut i = 0;
        while i < logs.len() {
            if i < end_idx && is_user_op_event(&logs[i]) && !is_ref_user_op(&logs[i]) {
                start_idx = i;
            } else if is_ref_user_op(&logs[i]) {
                end_idx = i;
            }

            i += 1;
        }

        if !is_ref_user_op(&logs[end_idx]) {
            return Err(EthRpcError::Internal(anyhow::anyhow!(
                "fatal: no user ops found in tx receipt ({start_idx},{end_idx})"
            )));
        }

        let start_idx = if start_idx == 0 { 0 } else { start_idx + 1 };
        Ok(logs[start_idx..=end_idx].to_vec())
    }

    fn get_user_operation_failure_reason(
        &self,
        logs: &[Log],
        user_op_hash: H256,
    ) -> EthResult<Option<String>> {
        let revert_reason_evt: Option<UserOperationRevertReasonFilter> = logs
            .iter()
            .filter(|l| l.topics.len() > 1 && l.topics[1] == user_op_hash)
            .map_while(|l| {
                UserOperationRevertReasonFilter::decode_log(&RawLog {
                    topics: l.topics.clone(),
                    data: l.data.to_vec(),
                })
                .ok()
            })
            .next();

        Ok(revert_reason_evt.map(|r| r.revert_reason.to_string()))
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
