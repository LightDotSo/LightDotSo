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
