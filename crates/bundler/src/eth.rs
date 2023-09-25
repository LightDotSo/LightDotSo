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

use std::sync::Arc;

use crate::{constants::ENTRYPOINT_ADDRESSES, eth_api::EthApiServer, server::UoPool};
use async_trait::async_trait;
use ethers::{
    types::{Address, U64},
    utils::to_checksum,
};
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::provider::get_provider;
use lightdotso_jsonrpsee::error::JsonRpcError;
use silius_contracts::EntryPoint;
use silius_primitives::{UserOperation, UserOperationGasEstimation, UserOperationPartial};

/// Entire file derved from: https://github.com/Vid201/silius/blob/b1841aa614a9410907d1801128bf500f2a87596f/crates/rpc/src/eth.rs
/// License: MIT or Apache-2.0
/// Thank you to Vid201 for the wonderful work!

/// EthApiServer implements the ERC-4337 `eth` namespace RPC methods trait
/// [EthApiServer](EthApiServer).
pub struct EthApiServerImpl {}

#[async_trait]
impl EthApiServer for EthApiServerImpl {
    /// Retrieve the current [EIP-155](https://eips.ethereum.org/EIPS/eip-155) chain ID.
    ///
    /// # Returns
    /// * `RpcResult<U64>` - The chain ID as a U64.
    async fn chain_id(&self, chain_id: u64) -> RpcResult<U64> {
        Ok(chain_id.into())
    }

    /// Get the supported entry points for [UserOperations](UserOperation).
    ///
    /// # Returns
    /// * `RpcResult<Vec<String>>` - A array of the entry point addresses as strings.
    async fn supported_entry_points(&self, _chain_id: u64) -> RpcResult<Vec<String>> {
        return Ok(ENTRYPOINT_ADDRESSES.into_iter().map(|ep| to_checksum(&ep, None)).collect());
    }

    /// Estimate the gas required for a [UserOperation](UserOperation) via the
    /// [EstimateUserOperationGasRequest](EstimateUserOperationGasRequest). This allows you to
    /// gauge the computational cost of the operation. See [How ERC-4337 Gas Estimation Works](https://www.alchemy.com/blog/erc-4337-gas-estimation).
    ///
    /// # Arguments
    /// * `user_operation: [UserOperationPartial](UserOperationPartial)` - The partial user
    ///   operation for which to estimate the gas.
    /// * `entry_point: Address` - The address of the entry point.
    ///
    /// # Returns
    /// * `RpcResult<UserOperationGasEstimation>` - The
    ///   [UserOperationGasEstimation](UserOperationGasEstimation) for the user operation.
    async fn estimate_user_operation_gas(
        &self,
        uo: UserOperationPartial,
        ep: Address,
        chain_id: u64,
    ) -> RpcResult<UserOperationGasEstimation> {
        // Get the provider.
        let provider = get_provider(chain_id).await.map_err(JsonRpcError::from)?;

        // Get the entry point.
        let entry_point = EntryPoint::new(Arc::new(provider.clone()), ep);

        // Parse the user operation.
        let uo: UserOperation = uo.into();

        // Get the server.
        let uopool = UoPool::new(entry_point, 3000000.into(), chain_id);

        // Estimate the gas.
        let res = uopool.estimate_user_operation_gas(&uo).await.map_err(JsonRpcError::from)?;

        Ok(res)
    }
}
