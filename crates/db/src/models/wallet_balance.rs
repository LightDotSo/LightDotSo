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

use alloy::primitives::Address;
use autometrics::autometrics;
use eyre::Result;
use lightdotso_sqlx::{
    sqlx::{
        postgres::{self},
        query_as, Error as SqlxError, FromRow, Row,
    },
    PostgresPool,
};
use prisma_client_rust::chrono::{DateTime, Utc};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug)]
pub struct WalletBalance {
    pub timestamp: DateTime<Utc>,
    pub balance_usd: f64,
    pub chain_id: i64,
    pub amount: i64,
    pub is_spam: bool,
    pub is_testnet: bool,
    pub wallet_address: String,
    pub token_id: String,
}

impl<'r> FromRow<'r, postgres::PgRow> for WalletBalance {
    fn from_row(row: &'r postgres::PgRow) -> Result<Self, SqlxError> {
        Ok(WalletBalance {
            timestamp: row.try_get("timestamp")?,
            balance_usd: row.try_get("balance_usd")?,
            chain_id: row.try_get("chain_id")?,
            amount: row.try_get("amount")?,
            is_spam: row.try_get("is_spam")?,
            is_testnet: row.try_get("is_testnet")?,
            wallet_address: row.try_get("wallet_address")?,
            token_id: row.try_get("token_id")?,
        })
    }
}

// -----------------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------------

#[autometrics]
pub async fn get_latest_wallet_balance_for_token(
    pool: &PostgresPool,
    token_id: String,
    wallet_address: Address,
) -> Result<Option<WalletBalance>, SqlxError> {
    let query = r#"
        SELECT timestamp, balance_usd, chain_id, amount, is_spam, is_testnet, wallet_address, token_id
        FROM WalletBalance
        WHERE token_id = $1
          AND wallet_address = $2
          AND is_latest = true
        ORDER BY timestamp DESC
        LIMIT 1
    "#;

    query_as::<_, WalletBalance>(query)
        .bind(token_id)
        .bind(wallet_address.to_checksum(None))
        .fetch_optional(pool)
        .await
}
