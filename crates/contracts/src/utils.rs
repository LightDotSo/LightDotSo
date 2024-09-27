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

// Rundler is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later version.
//
// Rundler is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with Rundler.
// If not, see https://www.gnu.org/licenses/.

#![allow(clippy::expect_used)]
#![allow(unused_doc_comments)]

use crate::entrypoint::EntryPoint::{ExecutionResult, FailedOp};
use alloy::{
    primitives::Bytes,
    providers::Provider,
    sol,
    sol_types::{ContractError, SolError},
};

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Gets the revert data from a contract error if it is a revert error,
/// otherwise returns the original error.
/// From: https://github.com/alchemyplatform/rundler/blob/ae615d0faa97b61a7e0a3d0a21793f383560ae35/crates/utils/src/eth.rs#L31-37
/// License: GNU Lesser General Public License v3.0
pub fn get_revert_bytes<M: Provider>(error: ContractError<M>) -> Result<Bytes, ContractError<M>> {
    if let ContractError::Revert(revert) = error {
        Ok(Bytes::from(revert.reason().as_bytes().to_vec()))
    } else {
        Err(error)
    }
}

/// The abi for what happens when you just `revert("message")` in a contract
/// From: https://github.com/alchemyplatform/rundler/blob/ae615d0faa97b61a7e0a3d0a21793f383560ae35/crates/utils/src/eth.rs#L39-45
/// License: GNU Lesser General Public License v3.0
sol! {
  error Error(string);
}

/// Decode the revert data into an `ExecutionResult` or a `FailedOp`.
/// From: https://github.com/alchemyplatform/rundler/blob/ae615d0faa97b61a7e0a3d0a21793f383560ae35/crates/provider/src/ethers/entry_point.rs#L141-155
/// License: GNU Lesser General Public License v3.0
pub fn decode_simulate_handle_ops_revert(revert_data: Bytes) -> Result<ExecutionResult, String> {
    if let Ok(result) = ExecutionResult::abi_decode(&revert_data, true) {
        Ok(result)
    } else if let Ok(failed_op) = FailedOp::abi_decode(&revert_data, true) {
        Err(failed_op.reason)
    } else if let Ok(err) = Error::abi_decode(&revert_data, true) {
        Err(err._0)
    } else {
        Err(String::new())
    }
}
