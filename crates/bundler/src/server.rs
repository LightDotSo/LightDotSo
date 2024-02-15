// Copyright 2023-2024 Light, Inc.
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
use ethers::types::{Address, H256, U64};
use jsonrpsee::core::RpcResult;
use rundler_sim::{GasEstimate, UserOperationOptionalGas};

use crate::{
    eth::EthApi,
    eth_api::EthApiServer,
    types::{RichUserOperation, UserOperationReceipt},
};

#[async_trait]
impl EthApiServer for EthApi {
    async fn estimate_user_operation_gas(
        &self,
        op: UserOperationOptionalGas,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasEstimate> {
        Ok(EthApi::estimate_user_operation_gas(self, op, entry_point, chain_id).await?)
    }

    async fn get_user_operation_by_hash(
        &self,
        hash: H256,
        chain_id: u64,
    ) -> RpcResult<Option<RichUserOperation>> {
        Ok(EthApi::get_user_operation_by_hash(self, hash, chain_id).await?)
    }

    async fn get_user_operation_receipt(
        &self,
        hash: H256,
        chain_id: u64,
    ) -> RpcResult<Option<UserOperationReceipt>> {
        Ok(EthApi::get_user_operation_receipt(self, hash, chain_id).await?)
    }

    async fn supported_entry_points(&self, chain_id: u64) -> RpcResult<Vec<String>> {
        Ok(EthApi::supported_entry_points(self, chain_id).await?)
    }

    async fn chain_id(&self, chain_id: u64) -> RpcResult<U64> {
        Ok(EthApi::chain_id(self, chain_id).await?)
    }
}
