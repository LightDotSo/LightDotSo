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
    pub contract_decimals: Option<i32>,
    pub contract_name: Option<String>,
    pub contract_ticker_symbol: Option<String>,
    pub contract_address: Option<String>,
    pub supports_erc: Option<Vec<String>>,
    pub logo_url: Option<String>,
    pub last_transferred_at: Option<String>,
    #[serde(alias = "type")]
    pub balance_type: Option<String>,
    pub balance: Option<String>,
    pub balance_24h: Option<String>,
    pub is_spam: bool,
    pub quote_rate: Option<f64>,
    pub quote_rate_24h: Option<f64>,
    pub quote: Option<f64>,
    pub quote_24h: Option<f64>,
    #[serde(skip_deserializing, skip_serializing)]
    nft_data: Option<Vec<()>>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct Balances {
    pub address: Option<String>,
    pub updated_at: Option<String>,
    pub next_update_at: Option<String>,
    pub quote_currency: Option<String>,
    pub chain_id: Option<i64>,
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
    name: Option<String>,
    #[serde(alias = "type")]
    pub param_type: Option<String>,
    pub indexed: bool,
    pub decoded: bool,
    // value is usually a String but can sometimes be a Vector(JS sequence/list)
    // for now avoiding using serde on it because of the type changing
    #[serde(skip_serializing, skip_deserializing)]
    pub value: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct LogDecoded {
    pub name: Option<String>,
    pub signature: Option<String>,
    pub params: Option<Vec<LogDecodedParams>>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct LogEventItem {
    pub block_signed_at: Option<String>,
    pub block_height: Option<i64>,
    pub tx_offset: Option<i64>,
    pub log_offset: Option<i64>,
    pub tx_hash: Option<String>,
    pub raw_log_topics: Option<Vec<String>>,
    pub sender_contract_decimals: Option<i32>,
    pub sender_name: Option<String>,
    pub sender_contract_ticker_symbol: Option<String>,
    pub sender_address: Option<String>,
    pub sender_address_label: Option<String>,
    pub sender_logo_url: Option<String>,
    pub raw_log_data: Option<String>,
    pub decoded: Option<LogDecoded>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct BaseTransaction {
    pub block_signed_at: Option<String>,
    pub block_height: Option<i32>,
    pub tx_hash: Option<String>,
    pub tx_offset: Option<i32>,
    pub successful: bool,
    pub from_address: Option<String>,
    pub from_address_label: Option<String>,
    pub to_address: Option<String>,
    pub to_address_label: Option<String>,
    pub value: Option<String>,
    pub value_quote: Option<f64>,
    pub gas_offered: Option<i64>,
    pub gas_spent: Option<i64>,
    pub gas_price: Option<i64>,
    pub fees_paid: Option<String>,
    pub gas_quote: Option<f64>,
    pub gas_quote_rate: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct BlockTransactionWithLogEvents {
    #[serde(flatten)]
    pub transaction: BaseTransaction,
    pub log_events: Option<Vec<LogEventItem>>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub struct Transactions {
    pub address: Option<String>,
    pub updated_at: Option<String>,
    pub next_update_at: Option<String>,
    pub quote_currency: Option<String>,
    pub chain_id: Option<i64>,
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
