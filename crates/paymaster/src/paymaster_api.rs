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
use ethers_main::types::{Address, Bytes, U256};
use jsonrpsee::{core::RpcResult, proc_macros::rpc};
use serde::{Deserialize, Serialize};
use silius_primitives::UserOperationPartial;

/// The paymaster and data returned by the paymaster.
pub type PaymasterAndData = Bytes;

/// The gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GasAndPaymasterAndData {
    pub call_gas_limit: U256,
    pub verification_gas_limit: U256,
    pub pre_verification_gas: U256,
    pub max_fee_per_gas: U256,
    pub max_priority_fee_per_gas: U256,
    pub paymaster_and_data: Bytes,
}

#[rpc(server, namespace = "paymaster")]
pub trait Paymaster {
    #[method(name = "requestPaymasterAndData")]
    async fn request_paymaster_and_data(
        &self,
        user_operation: UserOperationPartial,
        entry_point: Address,
    ) -> RpcResult<PaymasterAndData>;

    #[method(name = "requestGasAndPaymasterAndData")]
    async fn request_gas_and_paymaster_and_data(
        &self,
        user_operation: UserOperationPartial,
        entry_point: Address,
    ) -> RpcResult<GasAndPaymasterAndData>;
}
