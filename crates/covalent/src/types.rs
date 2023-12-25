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

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct ApiError {
    pub error: bool,
    pub error_message: Option<String>,
    pub error_code: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct ApiPagination {
    pub has_more: bool,
    pub page_number: Option<String>,
    pub page_size: Option<i32>,
    pub total_count: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct WalletBalanceItem {
    pub contract_decimals: i32,
    pub contract_name: String,
    pub contract_ticker_symbol: String,
    pub contract_address: String,
    pub supports_erc: Option<Vec<String>>,
    pub logo_url: String,
    pub last_transferred_at: Option<String>,
    #[serde(alias = "type")]
    pub balance_type: String,
    pub balance: String,
    pub balance_24h: Option<String>,
    pub quote_rate: Option<f64>,
    pub quote_rate_24h: Option<f64>,
    pub quote: f64,
    pub quote_24h: Option<f64>,
    #[serde(skip_deserializing, skip_serializing)]
    nft_data: Option<Vec<()>>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct Balances {
    pub address: String,
    pub updated_at: String,
    pub next_update_at: String,
    pub quote_currency: String,
    pub chain_id: i64,
    pub items: Vec<WalletBalanceItem>,
    #[serde(flatten)]
    pub pagination: Option<ApiPagination>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct BalancesData {
    pub data: Balances,
    #[serde(flatten)]
    pub error: ApiError,
}
