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
pub struct ApiPagination {
    pub has_more: bool,
    pub page_number: Option<String>,
    pub page_size: Option<i32>,
    pub total_count: Option<i32>,
}

// -----------------------------------------------------------------------------
// Balance Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Transaction Types
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct LogDecodedParams {
    name: String,
    #[serde(alias = "type")]
    pub param_type: String,
    pub indexed: bool,
    pub decoded: bool,
    // value is usually a String but can sometimes be a Vector(JS sequence/list)
    // for now avoiding using serde on it because of the type changing
    #[serde(skip_serializing, skip_deserializing)]
    pub value: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct LogDecoded {
    pub name: String,
    pub signature: String,
    pub params: Option<Vec<LogDecodedParams>>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct LogEventItem {
    pub block_signed_at: String,
    pub block_height: i64,
    pub tx_offset: i64,
    pub log_offset: i64,
    pub tx_hash: String,
    pub raw_log_topics: Option<Vec<String>>,
    pub sender_contract_decimals: i32,
    pub sender_name: Option<String>,
    pub sender_contract_ticker_symbol: Option<String>,
    pub sender_address: String,
    pub sender_address_label: Option<String>,
    pub sender_logo_url: Option<String>,
    pub raw_log_data: Option<String>,
    pub decoded: Option<LogDecoded>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct BaseTransaction {
    pub block_signed_at: String,
    pub block_height: i32,
    pub tx_hash: String,
    pub tx_offset: i32,
    pub successful: bool,
    pub from_address: String,
    pub from_address_label: Option<String>,
    pub to_address: String,
    pub to_address_label: Option<String>,
    pub value: String,
    pub value_quote: f64,
    pub gas_offered: i64,
    pub gas_spent: i64,
    pub gas_price: i64,
    pub fees_paid: Option<String>,
    pub gas_quote: f64,
    pub gas_quote_rate: f64,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct BlockTransactionWithLogEvents {
    #[serde(flatten)]
    pub transaction: BaseTransaction,
    pub log_events: Option<Vec<LogEventItem>>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct Transactions {
    pub address: String,
    pub updated_at: String,
    pub next_update_at: String,
    pub quote_currency: String,
    pub chain_id: i64,
    pub items: Vec<BlockTransactionWithLogEvents>,
    #[serde(flatten)]
    pub pagination: Option<ApiPagination>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct TransactionsData {
    pub data: Transactions,
    #[serde(flatten)]
    pub error: ApiError,
}
