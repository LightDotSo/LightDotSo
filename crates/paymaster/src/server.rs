// Copyright 2023-2024 Light
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

use async_trait::async_trait;
use ethers::types::Address;
use jsonrpsee::core::RpcResult;

use crate::{
    paymaster::PaymasterApi,
    paymaster_api::PaymasterApiServer,
    types::{GasAndPaymasterAndData, PaymasterAndData, UserOperationRequest},
};

#[async_trait]
impl PaymasterApiServer for PaymasterApi {
    async fn request_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<PaymasterAndData> {
        Ok(PaymasterApi::request_paymaster_and_data(self, user_operation, entry_point, chain_id)
            .await?)
    }

    async fn request_gas_and_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasAndPaymasterAndData> {
        Ok(PaymasterApi::request_gas_and_paymaster_and_data(
            self,
            user_operation,
            entry_point,
            chain_id,
        )
        .await?)
    }
}
