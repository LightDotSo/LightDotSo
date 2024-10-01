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

use crate::constants::InterpretationActionType;
use alloy::primitives::{Address, Bytes, Log};
use revm::{interpreter::InstructionResult, primitives::U256};
use revm_inspectors::tracing::types::{CallKind, CallTraceNode};
use serde::{Deserialize, Serialize};

// Entire file is derived from https://github.com/EnsoFinance/transaction-simulator/blob/42bc679fb171de760838457820d5c6622e53ab15/src/simulation.rs
// License: MIT

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct InterpretationRequest {
    /// Block number of the request
    pub block_number: Option<u64>,
    /// Gas limit of the transaction
    pub gas_limit: u64,
    /// From address of the transaction
    pub from: Address,
    /// To address of the transaction
    pub to: Option<Address>,
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
            to: Some(Address::default()),
            chain_id: 0,
            call_data: Some(Bytes::new()),
            value: None,
            traces: Vec::new(),
            logs: Vec::new(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct InterpretationResponse {
    /// Chain ID of the interpretation
    pub chain_id: u64,
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
            chain_id: 0,
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

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct InterpretationAction {
    /// The action that was interpreted
    pub action_type: InterpretationActionType,
    /// The actor of the action
    pub address: Option<Address>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct AdapterResponse {
    /// Actions that were interpreted
    pub actions: Vec<InterpretationAction>,
    /// Changes in the assets of the transaction
    pub asset_changes: Vec<AssetChange>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct AssetChange {
    /// Address of the asset holder
    pub address: Address,
    /// Amount of the asset before the transaction
    pub before_amount: Option<U256>,
    /// Amount of the asset after the transaction
    pub after_amount: Option<U256>,
    /// The amount of the asset that was transferred
    pub amount: U256,
    /// The action that was interpreted
    pub action: InterpretationAction,
    /// The token that was transferred
    pub token: AssetToken,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct AssetToken {
    /// Address of the token
    pub address: Address,
    /// The optional id of the token
    pub token_id: Option<U256>,
    /// The type of the token
    pub token_type: AssetTokenType,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum AssetTokenType {
    /// ERC20 token
    Erc20,
    /// ERC721 token
    Erc721,
    /// ERC1155 token
    Erc1155,
    /// Other token
    Other,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct CallTrace {
    /// The type of the call
    pub call_type: CallKind,
    /// The address of the caller
    pub from: Address,
    /// The address of the callee
    pub to: Address,
    /// The value of the call
    pub value: Option<U256>,
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
