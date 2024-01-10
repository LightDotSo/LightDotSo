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

use crate::constants::InterpretationActionType;
use ethers_main::{
    abi::{Address, Uint},
    types::{Bytes, Log},
};
use foundry_evm::{trace::node::CallTraceNode, CallKind};
use revm::interpreter::InstructionResult;
use serde::{Deserialize, Serialize};

// Entire file is derived from https://github.com/EnsoFinance/transaction-simulator/blob/42bc679fb171de760838457820d5c6622e53ab15/src/simulation.rs
// License: MIT

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InterpretationRequest {
    /// Block number of the request
    pub block_number: Option<u64>,
    /// Gas limit of the transaction
    pub gas_limit: u64,
    /// From address of the transaction
    pub from: Address,
    /// To address of the transaction
    pub to: Address,
    /// Chain ID of the simulation
    pub chain_id: u64,
    /// Call data of the transaction
    pub call_data: Option<Bytes>,
    /// Value to send
    pub value: Option<u64>,
    /// Trace of the transaction
    pub traces: Vec<CallTrace>,
    /// Logs of the transaction
    pub logs: Vec<Log>,
}

impl Default for InterpretationRequest {
    fn default() -> Self {
        Self {
            block_number: None,
            gas_limit: u64::MAX,
            from: Address::default(),
            to: Address::default(),
            chain_id: 0,
            call_data: Some(Bytes::new()),
            value: None,
            traces: Vec::new(),
            logs: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InterpretationResponse {
    /// Gas used by the transaction
    pub gas_used: u64,
    /// Block number of the simulation
    pub block_number: u64,
    /// Whether the transaction was successful
    pub success: bool,
    /// Trace of the transaction
    pub traces: Vec<CallTrace>,
    /// Logs of the transaction
    pub logs: Vec<Log>,
    /// Exit reason of the transaction
    pub exit_reason: InstructionResult,
    /// Actions that were interpreted
    pub actions: Vec<InterpretationAction>,
    /// Changes in the assets of the transaction
    pub asset_changes: Vec<AssetChange>,
}

impl Default for InterpretationResponse {
    fn default() -> Self {
        Self {
            gas_used: 0,
            block_number: 0,
            success: false,
            traces: Vec::new(),
            logs: Vec::new(),
            exit_reason: InstructionResult::Stop,
            actions: Vec::new(),
            asset_changes: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InterpretationAction {
    pub action_type: InterpretationActionType,
    pub address: Option<Address>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AdapterResponse {
    /// Actions that were interpreted
    pub actions: Vec<InterpretationAction>,
    /// Changes in the assets of the transaction
    pub asset_changes: Vec<AssetChange>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AssetChange {
    pub address: Address,
    pub before_amount: Uint,
    pub after_amount: Uint,
    pub amount: Uint,

    pub action: InterpretationAction,
    pub token: AssetToken,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AssetToken {
    pub address: Address,
    pub token_id: Option<Uint>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CallTrace {
    pub call_type: CallKind,
    pub from: Address,
    pub to: Address,
    pub value: Option<Uint>,
}

impl From<CallTraceNode> for CallTrace {
    fn from(node: CallTraceNode) -> Self {
        CallTrace {
            call_type: node.kind(),
            from: node.trace.caller,
            to: node.trace.address,
            value: Some(node.trace.value),
        }
    }
}
