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

use std::{collections::HashMap, sync::Arc};

use crate::{
    constants::ENTRYPOINT_ADDRESSES, errors::EthRpcError, eth_api::EthApiServer,
    provider::get_provider,
};
use async_trait::async_trait;
use ethers::{
    types::{Address, U64},
    utils::to_checksum,
};
use jsonrpsee::core::RpcResult;
use rundler_sim::{
    GasEstimate, GasEstimationError, GasEstimator, GasEstimatorImpl, UserOperationOptionalGas,
};
use rundler_types::contracts::i_entry_point::IEntryPoint;

/// The eth server implementation.
pub struct EthApiServerImpl {}

#[async_trait]
impl EthApiServer for EthApiServerImpl {
    async fn chain_id(&self, chain_id: u64) -> RpcResult<U64> {
        Ok(chain_id.into())
    }

    async fn supported_entry_points(&self, _chain_id: u64) -> RpcResult<Vec<String>> {
        return Ok(ENTRYPOINT_ADDRESSES.into_iter().map(|ep| to_checksum(&ep, None)).collect());
    }

    async fn estimate_user_operation_gas(
        &self,
        op: UserOperationOptionalGas,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasEstimate> {
        let provider =
            get_provider(1).await.map_err(lightdotso_jsonrpsee::error::JsonRpcError::from)?;
        let entry_points = ENTRYPOINT_ADDRESSES
            .iter()
            .map(|addr| (*addr, IEntryPoint::new(*addr, Arc::new(provider.clone()))))
            .collect::<HashMap<_, _>>();

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
}
