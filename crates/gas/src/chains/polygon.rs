// Copyright 2023-2024 LightDotSo.
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

use crate::types::GasEstimationParams;
use alloy::primitives::U256;
use eyre::{eyre, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
struct GasData {
    #[serde(rename = "maxPriorityFee")]
    max_priority_fee: f64,
    #[serde(rename = "maxFee")]
    max_fee: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ApiResponse {
    #[serde(rename = "safeLow")]
    safe_low: GasData,
    standard: GasData,
    fast: GasData,
    #[serde(rename = "estimatedBaseFee")]
    estimated_base_fee: f64,
    #[serde(rename = "blockTime")]
    block_time: u32,
    #[serde(rename = "blockNumber")]
    block_number: u32,
}

impl From<ApiResponse> for GasEstimationParams {
    fn from(data: ApiResponse) -> Self {
        let make_params = |gas_data: &GasData| -> GasEstimationParams {
            GasEstimationParams {
                max_priority_fee_per_gas: from_gwei_f64(gas_data.max_priority_fee),
                max_fee_per_gas: from_gwei_f64(gas_data.max_fee),
            }
        };

        make_params(&data.fast)
    }
}

pub async fn polygon_gas_estimation(chain_id: u64) -> Result<GasEstimationParams> {
    let client = reqwest::Client::builder().user_agent("Your-User-Agent").build()?;

    let url = match chain_id {
        137 => "https://gasstation.polygon.technology/v2",
        80002 => "https://gasstation-testnet.polygon.technology/v2",
        _ => return Err(eyre!("Unsupported chain ID")),
    };

    let response = client.get(url).send().await?.json::<ApiResponse>().await?;

    // Check if any of the values is 0
    if response.safe_low.max_priority_fee == 0.0 ||
        response.safe_low.max_fee == 0.0 ||
        response.standard.max_priority_fee == 0.0 ||
        response.standard.max_fee == 0.0 ||
        response.fast.max_priority_fee == 0.0 ||
        response.fast.max_fee == 0.0
    {
        return Err(eyre!("API returned a value of 0"));
    }

    // Convert to GasEstimation using From trait
    Ok(response.into())
}

// From: https://github.com/gakonst/ethers-rs/blob/fa3017715a298728d9fb341933818a5d0d84c2dc/ethers-middleware/src/gas_oracle/mod.rs#L39
// License: MIT
pub(crate) const GWEI_TO_WEI: u64 = 1_000_000_000;
// pub(crate) const GWEI_TO_WEI_U256: U256 = U256::from_limbs([GWEI_TO_WEI, 0, 0, 0]);

// From: https://github.com/gakonst/ethers-rs/blob/fa3017715a298728d9fb341933818a5d0d84c2dc/ethers-middleware/src/gas_oracle/mod.rs#L155
// License: MIT
pub(crate) fn from_gwei_f64(gwei: f64) -> U256 {
    U256::from((gwei * GWEI_TO_WEI as f64) as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_polygon_gas_estimation() {
        // Test for polygon
        let chain_id = 137;
        let result = polygon_gas_estimation(chain_id).await;
        assert!(result.is_ok());
        let gas_estimation = result.unwrap();
        assert!(gas_estimation.max_priority_fee_per_gas > U256::from(0));
        assert!(gas_estimation.max_fee_per_gas > U256::from(0));
    }

    #[tokio::test]
    async fn test_polygon_gas_estimation_unsupported_chain_id() {
        // Test for an unsupported chain ID
        let chain_id = 999;
        let result = polygon_gas_estimation(chain_id).await;
        assert!(result.is_err());
        let error = result.unwrap_err();
        assert_eq!(error.to_string(), "Unsupported chain ID");
    }
}
