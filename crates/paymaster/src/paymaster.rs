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

use crate::paymaster_api::PaymasterServer;
use async_trait::async_trait;
use jsonrpsee::core::RpcResult;

pub struct PaymasterServerImpl {}

#[async_trait]
impl PaymasterServer for PaymasterServerImpl {
    async fn reuest_paymaster_and_data(&self) -> RpcResult<String> {
        return Ok(format!("paymaster/{}", env!("CARGO_PKG_VERSION")));
    }

    async fn reuest_gas_and_paymaster_and_data(&self) -> RpcResult<String> {
        return Ok(format!("paymaster/{}", env!("CARGO_PKG_VERSION")));
    }
}
