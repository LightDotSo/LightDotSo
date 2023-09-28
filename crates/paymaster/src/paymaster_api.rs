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

pub use crate::paymaster::PaymasterServerImpl;
use crate::types::{GasAndPaymasterAndData, PaymasterAndData, UserOperationRequest};
use ethers::types::Address;
use jsonrpsee::{core::RpcResult, proc_macros::rpc};

#[rpc(server, namespace = "paymaster")]
pub trait Paymaster {
    #[method(name = "requestPaymasterAndData")]
    async fn request_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<PaymasterAndData>;

    #[method(name = "requestGasAndPaymasterAndData")]
    async fn request_gas_and_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasAndPaymasterAndData>;
}
