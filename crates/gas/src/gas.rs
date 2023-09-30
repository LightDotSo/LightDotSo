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

use crate::{chains::polygon::polygon_gas_estimation, gas_api::GasServer};
use async_trait::async_trait;
use ethers::{providers::Middleware, types::BlockNumber};
use ethers_main::types::U256;
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::provider::get_provider;
use lightdotso_jsonrpsee::error::JsonRpcError;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use std::ops::{Div, Mul};

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
    async fn request_gas_estimation(&self, chain_id: u64) -> RpcResult<GasEstimation> {
        // Get the estimation from pre-configured APIs
        let estimation = get_estimation(chain_id).await;

        // Return if some
        if let Some(params) = estimation {
            return Ok(create_gas_estimation(&params));
        }

        // Setup a new ethers provider
        let client = get_provider(chain_id).await.map_err(JsonRpcError::from)?;

        // Get the gas price from the client
        let mut gas_price = client.get_gas_price().await.map_err(JsonRpcError::from)?;
        info!("Gas price for chain {} is {:?}", chain_id, gas_price);

        // For Arbitrum, we need to multiply the gas price by 5/4
        // From: https://github.com/pimlicolabs/alto/blob/58bcc4e75a214f9074c7d4c73626960527fa43ce/packages/utils/src/gasPrice.ts#L81
        // License: GPL-3.0
        if chain_id == 42161 {
            let gas_price = gas_price * 5 / 4;
            let params = GasEstimationParams {
                max_fee_per_gas: gas_price,
                max_priority_fee_per_gas: gas_price,
            };
            return Ok(create_gas_estimation(&params));
        }

        // Get the fee history
        let fee_history = client
            .fee_history(10, BlockNumber::Latest, &[20.0])
            .await
            .map_err(JsonRpcError::from)?;

        if fee_history.reward.is_empty() {
            let gas_price = gas_price * 3 / 2;
            // Use the gas price to create the params
            let params = GasEstimationParams {
                max_fee_per_gas: gas_price,
                max_priority_fee_per_gas: gas_price,
            };
            return Ok(create_gas_estimation(&params));
        };

        // Get the average gas price
        let fee_average = fee_history.reward.iter().fold(0, |acc, cur| cur[0].as_u32() + acc) / 10;
        let fee_average = U256::from(fee_average);

        // Compare the average gas price with the current gas price
        if fee_average > gas_price {
            gas_price = fee_average;
        }
        let max_priority_fee_per_gas = gas_price;

        // Use the gas price to create the params
        let params = GasEstimationParams { max_fee_per_gas: gas_price, max_priority_fee_per_gas };

        Ok(create_gas_estimation(&params))
    }
}

/// Create a gas estimation from the given gas price
/// Arbitary multiplication from: https://github.com/pimlicolabs/alto/blob/2981f50eb6fc4692939f13802e799149c554734b/packages/rpc/src/rpcHandler.ts#L531
/// License: GPL-3.0
fn create_gas_estimation(gas_price: &GasEstimationParams) -> GasEstimation {
    let low_params = GasEstimationParams {
        max_fee_per_gas: gas_price.max_fee_per_gas.mul(U256::from(105)).div(U256::from(100)),
        max_priority_fee_per_gas: gas_price
            .max_priority_fee_per_gas
            .mul(U256::from(105))
            .div(U256::from(100)),
    };

    let average_params = GasEstimationParams {
        max_fee_per_gas: gas_price.max_fee_per_gas.mul(U256::from(110)).div(U256::from(100)),
        max_priority_fee_per_gas: gas_price
            .max_priority_fee_per_gas
            .mul(U256::from(110))
            .div(U256::from(100)),
    };

    let high_params = GasEstimationParams {
        max_fee_per_gas: gas_price.max_fee_per_gas.mul(U256::from(115)).div(U256::from(100)),
        max_priority_fee_per_gas: gas_price
            .max_priority_fee_per_gas
            .mul(U256::from(115))
            .div(U256::from(100)),
    };

    let instant_params = GasEstimationParams {
        max_fee_per_gas: gas_price.max_fee_per_gas.mul(U256::from(120)).div(U256::from(100)),
        max_priority_fee_per_gas: gas_price
            .max_priority_fee_per_gas
            .mul(U256::from(120))
            .div(U256::from(100)),
    };

    GasEstimation {
        low: low_params,
        average: average_params,
        high: high_params,
        instant: instant_params,
    }
}

/// Get the gas estimation from pre-configured APIs
async fn get_estimation(chain_id: u64) -> Option<GasEstimationParams> {
    match chain_id {
        // Match either 1 or 11155111
        // 1 | 11155111 => match ethereum_gas_estimation(chain_id).await {
        //     Ok(res) => Some(res),
        //     Err(_) => None,
        // },
        // Match either 137 or 80001
        137 | 80001 => match polygon_gas_estimation(chain_id).await {
            Ok(res) => Some(res),
            Err(_) => None,
        },
        _ => None,
    }
}
