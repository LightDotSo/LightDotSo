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
