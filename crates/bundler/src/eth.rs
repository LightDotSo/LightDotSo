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

use crate::{constants::ENTRYPOINT_ADDRESSES, eth_api::EthApiServer};
use async_trait::async_trait;
use ethers::{types::U64, utils::to_checksum};
use jsonrpsee::core::RpcResult;

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
}
