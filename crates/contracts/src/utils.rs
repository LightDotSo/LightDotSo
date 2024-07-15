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

#![allow(clippy::expect_used)]

use crate::entrypoint::{ExecutionResult, FailedOp};
use ethers::{abi::AbiDecode, contract::ContractError, providers::Middleware, types::Bytes};
use lightdotso_constants::chains::{MAINNET_CHAIN_IDS, TESTNET_CHAIN_IDS};

/// Returns `true` if the chain ID is a testnet chain ID.
/// Falls back to `true` if the chain ID is not a mainnet chain ID.
pub fn is_testnet(chain_id: u64) -> bool {
    TESTNET_CHAIN_IDS.contains_key(&chain_id) || !MAINNET_CHAIN_IDS.contains_key(&chain_id)
}

/// Gets the revert data from a contract error if it is a revert error,
/// otherwise returns the original error.
pub fn get_revert_bytes<M: Middleware>(error: ContractError<M>) -> Result<Bytes, ContractError<M>> {
    if let ContractError::Revert(bytes) = error {
        Ok(bytes)
    } else {
        Err(error)
    }
}

/// The abi for what happens when you just `revert("message")` in a contract
#[derive(Clone, Debug, Default, Eq, PartialEq, ethers::contract::EthError)]
#[etherror(name = "Error", abi = "Error(string)")]
pub struct ContractRevertError {
    /// Revert reason
    pub reason: String,
}

pub fn decode_simulate_handle_ops_revert(revert_data: Bytes) -> Result<ExecutionResult, String> {
    if let Ok(result) = ExecutionResult::decode(&revert_data) {
        Ok(result)
    } else if let Ok(failed_op) = FailedOp::decode(&revert_data) {
        Err(failed_op.reason)
    } else if let Ok(err) = ContractRevertError::decode(&revert_data) {
        Err(err.reason)
    } else {
        Err(String::new())
    }
}
