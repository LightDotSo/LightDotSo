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

use crate::{chains::_1::mainnet_gas_estimation, error::JsonRpcError, gas_api::GasServer};
use async_trait::async_trait;
use jsonrpsee::{
    core::RpcResult,
    types::{error::INTERNAL_ERROR_CODE, ErrorObjectOwned},
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GasEstimationParams {
    pub(crate) max_priority_fee_per_gas: u64,
    pub(crate) max_fee_per_gas: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GasEstimation {
    pub(crate) low: GasEstimationParams,
    pub(crate) average: GasEstimationParams,
    pub(crate) high: GasEstimationParams,
    pub(crate) instant: GasEstimationParams,
}

pub struct GasServerImpl {}

#[async_trait]
impl GasServer for GasServerImpl {
    async fn client_version(&self) -> RpcResult<String> {
        return Ok(format!("light/{}", env!("CARGO_PKG_VERSION")));
    }

    async fn request_gas_estimation(&self, chain_id: u64) -> RpcResult<GasEstimation> {
        match chain_id {
            1 => match mainnet_gas_estimation().await {
                Ok(res) => Ok(res),
                Err(s) => Err(JsonRpcError::from(s).into()),
            },
            _ => Err(ErrorObjectOwned::owned(
                INTERNAL_ERROR_CODE,
                "Chain not supported".to_string(),
                None::<bool>,
            )),
        }
    }
}
