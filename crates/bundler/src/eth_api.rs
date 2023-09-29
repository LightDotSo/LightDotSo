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

use ethers::types::{Address, H256, U64};
use jsonrpsee::{core::RpcResult, proc_macros::rpc};
use rundler_sim::{GasEstimate, UserOperationOptionalGas};

use crate::types::{RichUserOperation, UserOperationReceipt};

/// Entire file derved from: https://github.com/Vid201/silius/blob/b1841aa614a9410907d1801128bf500f2a87596f/crates/rpc/src/eth_api.rs
/// License: MIT or Apache-2.0
/// Thank you to Vid201 for the wonderful work!

#[rpc(client, server, namespace = "eth")]
#[cfg_attr(test, automock)]
pub trait EthApi {
    /// Sends a user operation to the pool.
    // #[method(name = "sendUserOperation")]
    // async fn send_user_operation(
    // &self,
    // op: RpcUserOperation,
    // entry_point: Address,
    // ) -> RpcResult<H256>;

    /// Estimates the gas fields for a user operation.
    #[method(name = "estimateUserOperationGas")]
    async fn estimate_user_operation_gas(
        &self,
        op: UserOperationOptionalGas,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasEstimate>;

    /// Returns the user operation with the given hash.
    #[method(name = "getUserOperationByHash")]
    async fn get_user_operation_by_hash(
        &self,
        hash: H256,
        chain_id: u64,
    ) -> RpcResult<Option<RichUserOperation>>;

    /// Returns the user operation receipt with the given hash.
    #[method(name = "getUserOperationReceipt")]
    async fn get_user_operation_receipt(
        &self,
        hash: H256,
        chain_id: u64,
    ) -> RpcResult<Option<UserOperationReceipt>>;

    /// Returns the supported entry points addresses
    #[method(name = "supportedEntryPoints")]
    async fn supported_entry_points(&self, chain_id: u64) -> RpcResult<Vec<String>>;

    /// Returns the chain ID
    #[method(name = "chainId")]
    async fn chain_id(&self, chain_id: u64) -> RpcResult<U64>;
}
