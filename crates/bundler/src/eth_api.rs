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

use ethers::types::{Address, U64};
use jsonrpsee::{core::RpcResult, proc_macros::rpc};
use silius_primitives::{UserOperationGasEstimation, UserOperationPartial};

/// Entire file derved from: https://github.com/Vid201/silius/blob/b1841aa614a9410907d1801128bf500f2a87596f/crates/rpc/src/eth_api.rs
/// License: MIT or Apache-2.0
/// Thank you to Vid201 for the wonderful work!

#[rpc(server, namespace = "eth")]
pub trait EthApi {
    /// Retrieve the current [EIP-155](https://eips.ethereum.org/EIPS/eip-155) chain ID.
    ///
    ///
    /// # Returns
    /// * `RpcResult<U64>` - The chain ID as a U64.
    #[method(name = "chainId")]
    async fn chain_id(&self, chain_id: u64) -> RpcResult<U64>;

    /// Get the supported entry points for [UserOperations](UserOperation).
    ///
    /// # Returns
    /// * `RpcResult<Vec<String>>` - A array of the entry point addresses as strings.
    #[method(name = "supportedEntryPoints")]
    async fn supported_entry_points(&self, chain_id: u64) -> RpcResult<Vec<String>>;

    /// Estimate the gas required for a user operation.
    /// This allows you to gauge the computational cost of the operation.
    /// See [How ERC-4337 Gas Estimation Works](https://www.alchemy.com/blog/erc-4337-gas-estimation).
    ///
    /// # Arguments
    /// * `user_operation: [UserOperationPartial](UserOperationPartial)` - A [partial user
    ///   operation](UserOperationPartial) for which to estimate the gas.
    /// * `entry_point: Address` - The address of the entry point.
    ///
    /// # Returns
    /// * `RpcResult<UserOperationGasEstimation>` - The estimated gas for the
    ///   [UserOperation](UserOperation)
    #[method(name = "estimateUserOperationGas")]
    async fn estimate_user_operation_gas(
        &self,
        user_operation: UserOperationPartial,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<UserOperationGasEstimation>;
}
