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

pub use crate::simulator::SimulatorServerImpl;
use crate::types::{SimulationRequest, UserOperationRequest};
use jsonrpsee::{core::RpcResult, proc_macros::rpc};

#[rpc(server, namespace = "simulator")]
pub trait Simulator {
    #[method(name = "simulateExecution")]
    async fn simulate_execution(&self, tx: SimulationRequest) -> RpcResult<String>;
    #[method(name = "simulateExecutionBundle")]
    async fn simulate_execution_bundle(&self, txs: Vec<SimulationRequest>) -> RpcResult<String>;
    #[method(name = "simulateAssetChanges")]
    async fn simulate_asset_changes(&self, tx: SimulationRequest) -> RpcResult<String>;
    #[method(name = "simulateAssetChangesBundle")]
    async fn simulate_asset_changes_bundle(&self, txs: Vec<SimulationRequest>)
        -> RpcResult<String>;
    #[method(name = "simulateUserOperation")]
    async fn simulate_user_operation(
        &self,
        user_operation: UserOperationRequest,
    ) -> RpcResult<String>;
    #[method(name = "simulateUserOperationBundle")]
    async fn simulate_user_operation_bundle(
        &self,
        user_operations: Vec<UserOperationRequest>,
    ) -> RpcResult<String>;
    #[method(name = "simulateUserOperationAssetChanges")]
    async fn simulate_user_operation_asset_changes(
        &self,
        user_operation: UserOperationRequest,
    ) -> RpcResult<String>;
    #[method(name = "simulateUserOperationAssetChangesBundle")]
    async fn simulate_user_operation_asset_changes_bundle(
        &self,
        user_operations: Vec<UserOperationRequest>,
    ) -> RpcResult<String>;
}
