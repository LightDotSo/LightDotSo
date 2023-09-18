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

use crate::{chains::_1::mainnet_gas_estimation, gas_api::GasServer};
use async_trait::async_trait;
use ethers_main::{
    providers::{Http, Middleware, Provider},
    types::U256,
};
use jsonrpsee::{
    core::RpcResult,
    types::{error::INTERNAL_ERROR_CODE, ErrorObjectOwned},
};
use lightdotso_tracing::tracing::{info, warn};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GasEstimationParams {
    pub max_priority_fee_per_gas: U256,
    pub max_fee_per_gas: U256,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GasEstimation {
    pub low: GasEstimationParams,
    pub average: GasEstimationParams,
    pub high: GasEstimationParams,
    pub instant: GasEstimationParams,
}

pub struct GasServerImpl {}

#[async_trait]
impl GasServer for GasServerImpl {
    async fn client_version(&self) -> RpcResult<String> {
        return Ok(format!("light/{}", env!("CARGO_PKG_VERSION")));
    }

    async fn request_gas_estimation(&self, chain_id: u64) -> RpcResult<GasEstimation> {
        let estimation = get_estimation(chain_id).await;
        // Return if some
        if let Some(estimation) = estimation {
            info!("Gas estimation for chain {} is {:?}", chain_id, estimation);
            return Ok(estimation);
        }

        // Setup a new ethers provider
        let eth_client = Provider::<Http>::try_from(format!(
            "http://lightdotso-rpc.internal:3000/internal/{}",
            chain_id
        ));

        // Get the gas price from the client
        if let Ok(client) = eth_client {
            let estimate_eip1559_fees = client.inner().estimate_eip1559_fees(None).await;
            info!("Gas estimation for chain {} is {:?}", chain_id, estimate_eip1559_fees);

            if let Ok(fee) = estimate_eip1559_fees {
                let params =
                    GasEstimationParams { max_fee_per_gas: fee.0, max_priority_fee_per_gas: fee.1 };
                return Ok(GasEstimation {
                    low: params.clone(),
                    average: params.clone(),
                    high: params.clone(),
                    instant: params.clone(),
                });
            }
        }

        warn!("Gas estimation for chain {} is not available", chain_id);
        Err(ErrorObjectOwned::owned(
            INTERNAL_ERROR_CODE,
            "Chain not supported".to_string(),
            None::<bool>,
        ))
    }
}

async fn get_estimation(chain_id: u64) -> Option<GasEstimation> {
    match chain_id {
        1 => match mainnet_gas_estimation().await {
            Ok(res) => Some(res),
            Err(_) => None,
        },
        // 1337 => match polygon_gas_estimation().await {
        //     Ok(res) => Some(res),
        //     Err(_) => None,
        // },
        _ => None,
    }
}
