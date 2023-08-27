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

// Entire file is derived from https://github.com/EnsoFinance/transaction-simulator/blob/42bc679fb171de760838457820d5c6622e53ab15/src/simulation.rs
// License: MIT

use crate::{evm::Evm, simulator_api::SimulatorServer};
use async_trait::async_trait;
use ethers_main::{
    abi::{Address, Uint},
    types::{Bytes, Log},
};
use eyre::{eyre, Result};
use foundry_evm::{trace::node::CallTraceNode, CallKind};
use jsonrpsee::core::RpcResult;
use revm::interpreter::InstructionResult;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationRequest {
    #[serde(rename = "chainId")]
    pub chain_id: u64,
    pub from: Address,
    pub to: Address,
    pub data: Option<Bytes>,
    #[serde(rename = "gasLimit")]
    pub gas_limit: u64,
    pub value: Option<String>,
    #[serde(rename = "blockNumber")]
    pub block_number: Option<u64>,
    #[serde(rename = "formatTrace")]
    pub format_trace: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SimulationResponse {
    #[serde(rename = "simulationId")]
    pub simulation_id: u64,
    #[serde(rename = "gasUsed")]
    pub gas_used: u64,
    #[serde(rename = "blockNumber")]
    pub block_number: u64,
    pub success: bool,
    pub trace: Vec<CallTrace>,
    #[serde(rename = "formattedTrace")]
    pub formatted_trace: Option<String>,
    pub logs: Vec<Log>,
    #[serde(rename = "exitReason")]
    pub exit_reason: InstructionResult,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CallTrace {
    #[serde(rename = "callType")]
    pub call_type: CallKind,
    pub from: Address,
    pub to: Address,
    pub value: Uint,
}

impl From<CallTraceNode> for CallTrace {
    fn from(node: CallTraceNode) -> Self {
        CallTrace {
            call_type: node.kind(),
            from: node.trace.caller,
            to: node.trace.address,
            value: node.trace.value,
        }
    }
}

pub struct SimulatorServerImpl {}

#[async_trait]
impl SimulatorServer for SimulatorServerImpl {
    async fn simulate_execution(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
    async fn simulate_execution_bundle(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
    async fn simulate_asset_changes(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
    async fn simulate_asset_changes_bundle(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
    async fn simulate_user_operation(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
    async fn simulate_user_operation_bundle(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
    async fn simulate_user_operation_asset_changes(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
    async fn simulate_user_operation_asset_changes_bundle(&self) -> RpcResult<String> {
        return Ok(format!("simulator/{}", env!("CARGO_PKG_VERSION")));
    }
}

fn get_fork_url(first_chain_id: u64) -> String {
    format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", first_chain_id)
}

async fn run(
    evm: &mut Evm,
    transaction: SimulationRequest,
    commit: bool,
) -> Result<SimulationResponse> {
    // Accept value in hex or decimal formats
    let value = if let Some(value) = transaction.value {
        if value.starts_with("0x") {
            Some(
                Uint::from_str(value.as_str())
                    .map_err(|_err| eyre!("Failed to parse value as hex: {}", value))?,
            )
        } else {
            Some(
                Uint::from_dec_str(value.as_str())
                    .map_err(|_err| eyre!("Failed to parse value as dec: {}", value))?,
            )
        }
    } else {
        None
    };

    let result = if commit {
        evm.call_raw_committing(
            transaction.from,
            transaction.to,
            value,
            transaction.data,
            transaction.gas_limit,
            transaction.format_trace.unwrap_or_default(),
        )
        .await
        .map_err(|_err| eyre!("Failed to commit transaction"))?
    } else {
        evm.call_raw(
            transaction.from,
            transaction.to,
            value,
            transaction.data,
            transaction.format_trace.unwrap_or_default(),
        )
        .await
        .map_err(|_err| eyre!("Failed to call transaction"))?
    };

    Ok(SimulationResponse {
        simulation_id: 1,
        gas_used: result.gas_used,
        block_number: result.block_number,
        success: result.success,
        trace: result.trace.unwrap_or_default().arena.into_iter().map(CallTrace::from).collect(),
        logs: result.logs,
        exit_reason: result.exit_reason,
        formatted_trace: result.formatted_trace,
    })
}

pub async fn simulate(transaction: SimulationRequest) -> Result<SimulationResponse> {
    let fork_url = get_fork_url(transaction.chain_id);
    let mut evm =
        Evm::new(None, fork_url, transaction.block_number, transaction.gas_limit, true, None).await;

    let response = run(&mut evm, transaction, false).await?;

    Ok(response)
}

pub async fn simulate_bundle(
    transactions: Vec<SimulationRequest>,
) -> Result<Vec<SimulationResponse>> {
    let first_chain_id = transactions[0].chain_id;
    let first_block_number = transactions[0].block_number;

    let fork_url = get_fork_url(first_chain_id);
    let mut evm =
        Evm::new(None, fork_url, first_block_number, transactions[0].gas_limit, true, None).await;

    let mut response = Vec::with_capacity(transactions.len());
    for transaction in transactions {
        if transaction.chain_id != first_chain_id {
            return Err(eyre!("Multiple chain ids"));
        }
        if transaction.block_number != first_block_number {
            return Err(eyre!("Multiple block numbers"));
        }
        response.push(run(&mut evm, transaction, true).await?);
    }

    Ok(response)
}
