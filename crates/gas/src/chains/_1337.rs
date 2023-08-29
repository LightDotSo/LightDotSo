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

use serde::{Deserialize, Serialize};

use crate::gas::{GasEstimation, GasEstimationParams};

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

impl From<ApiResponse> for GasEstimation {
    fn from(data: ApiResponse) -> Self {
        let make_params = |gas_data: &GasData| -> GasEstimationParams {
            GasEstimationParams {
                max_priority_fee_per_gas: gas_data.max_priority_fee,
                max_fee_per_gas: gas_data.max_fee,
            }
        };

        Self {
            low: make_params(&data.safe_low),
            average: make_params(&data.standard),
            high: make_params(&data.fast),
            instant: make_params(&data.fast),
        }
    }
}

pub async fn polygon_gas_estimation() -> Result<GasEstimation, reqwest::Error> {
    let response = reqwest::get("https://gasstation.polygon.technology/v2")
        .await?
        .json::<ApiResponse>()
        .await?;

    // Convert to GasEstimation using From trait
    Ok(response.into())
}
