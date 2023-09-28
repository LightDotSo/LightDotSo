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

use crate::types::{RichUserOperation, RpcUserOperation, UserOperationReceipt};
use ethers::types::{Address, H256, U64};
use jsonrpsee::{core::RpcResult, proc_macros::rpc};
use rundler_sim::{GasEstimate, UserOperationOptionalGas};

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

    //// Estimate the gas required for a user operation.
    //// This allows you to gauge the computational cost of the operation.
    //// See [How ERC-4337 Gas Estimation Works](https://www.alchemy.com/blog/erc-4337-gas-estimation).
    ////
    //// # Arguments
    //// * `user_operation: [UserOperationOptionalGas](UserOperationOptionalGas)` - A [partial user
    ////   operation](UserOperationOptionalGas) for which to estimate the gas.
    //// * `entry_point: Address` - The address of the entry point.
    ////
    //// # Returns
    //// * `RpcResult<GasEstimate>` - The estimated gas for the
    ////   [UserOperation](UserOperation)
    // #[method(name = "estimateUserOperationGas")]
    // async fn estimate_user_operation_gas(
    //     &self,
    //     user_operation: UserOperationOptionalGas,
    //     entry_point: Address,
    // ) -> RpcResult<GasEstimate>;

    //// Send a [UserOperation](UserOperation).
    ////
    //// # Arguments
    //// * `user_operation: RpcUserOperation` - The [RpcUserOperation](RpcUserOperation) to be sent.
    //// * `entry_point: Address` - The address of the entry point.
    ////
    //// # Returns
    //// * `RpcResult<UserOperationHash>` - The hash of the sent [UserOperation](UserOperation).
    // #[method(name = "sendUserOperation")]
    // async fn send_user_operation(
    //     &self,
    //     user_operation: RpcUserOperation,
    //     entry_point: Address,
    //     chain_id: u64,
    // ) -> RpcResult<H256>;

    //// Retrieve the receipt of a [UserOperation](UserOperation).
    //// The receipt contains the results of the operation, such as the amount of gas used.
    ////
    //// # Arguments
    //// * `user_operation_hash: H256` - The hash of a [UserOperation](UserOperation).
    ////
    //// # Returns
    //// * `RpcResult<Option<UserOperationReceipt>>` - The receipt of the
    ////   [UserOperation](UserOperation), or None if it does not exist.
    // #[method(name = "getUserOperationReceipt")]
    // async fn get_user_operation_receipt(
    //     &self,
    //     hash: H256,
    //     chain_id: u64,
    // ) -> RpcResult<Option<UserOperationReceipt>>;

    //// Retrieve a [UserOperation](UserOperation) by its hash.
    //// The hash serves as a unique identifier for the operation.
    ////
    //// # Arguments
    //// * `user_operation_hash: String` - The hash of the user operation.
    ////
    //// # Returns
    //// * `RpcResult<Option<UserOperationByHash>>` - The [UserOperation](UserOperation) associated
    ////   with the hash, or None if it does not exist.
    // #[method(name = "getUserOperationByHash")]
    // async fn get_user_operation_by_hash(
    //     &self,
    //     user_operation_hash: String,
    //     chain_id: u64,
    // ) -> RpcResult<Option<RichUserOperation>>;
}
