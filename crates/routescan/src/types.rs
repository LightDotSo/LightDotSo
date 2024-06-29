// Copyright 2023-2024 Light.
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

use serde::{Deserialize, Serialize};

// -----------------------------------------------------------------------------
// API Base Types
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct ApiError {
    pub error: bool,
    pub error_message: Option<String>,
    pub error_code: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct ApiPaginationLink {
    pub next: Option<String>,
    #[serde(rename = "nextToken")]
    pub next_token: Option<String>,
}

// -----------------------------------------------------------------------------
// Balance Types
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct WalletBalanceItem {
    #[serde(rename = "chainId")]
    pub chain_id: Option<String>,
    #[serde(rename = "tokenAddress")]
    pub token_address: Option<String>,
    #[serde(rename = "tokenName")]
    pub token_name: Option<String>,
    #[serde(rename = "tokenSymbol")]
    pub token_symbol: Option<String>,
    #[serde(rename = "tokenDecimals")]
    pub token_decimals: Option<i32>,
    #[serde(rename = "tokenQuantity")]
    pub token_quantity: Option<String>,
    #[serde(rename = "tokenPrice")]
    pub token_price: Option<String>,
    #[serde(rename = "tokenValueInUsd")]
    pub token_value_in_usd: Option<String>,
    #[serde(rename = "updatedAtBlock")]
    pub updated_at_block: Option<i64>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct BalancesData {
    pub items: Vec<WalletBalanceItem>,
    pub count: Option<i32>,
    #[serde(rename = "countType")]
    pub count_type: Option<String>,
    pub link: ApiPaginationLink,
}

// -----------------------------------------------------------------------------
// Native Balance Types
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct NativeBalanceData {
    pub status: String,
    pub message: String,
    pub result: i64,
}
