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
        query, query_as, Error as SqlxError, FromRow, QueryBuilder, Row,
    },
    PostgresPool,
};
use prisma_client_rust::chrono::{DateTime, Utc};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug)]
pub struct WalletBalanceInput {
    pub quote: f64,
    pub chain_id: i64,
    pub wallet_address: String,
    pub amount: Option<String>,
    pub stable: Option<bool>,
    pub token_id: String,
    pub is_spam: bool,
    pub is_testnet: bool,
}

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

#[autometrics]
pub async fn create_wallet_balances(
    pool: &PostgresPool,
    wallet_address: String,
    chain_id: i64,
    balances: Vec<WalletBalanceInput>,
) -> Result<i64> {
    let mut tx = pool.begin().await?;

    // Set all existing balances for this wallet and chain to not latest
    query(
        "UPDATE wallet_balance
         SET is_latest = false
         WHERE wallet_address = $1 AND chain_id = $2",
    )
    .bind(&wallet_address)
    .bind(chain_id)
    .execute(&mut tx)
    .await?;

    // Insert new balances
    let mut inserted = 0;
    for balance in balances {
        let amount = balance.amount.unwrap_or_else(|| "0".to_string());
        let result = query(
            "INSERT INTO wallet_balance 
             (timestamp, balance_usd, chain_id, amount, stable, is_spam, is_latest, is_testnet, wallet_address, token_id)
             VALUES 
             (CURRENT_TIMESTAMP, $1, $2, $3, $4, $5, true, $6, $7, $8)"
        )
        .bind(balance.quote)
        .bind(balance.chain_id)
        .bind(&amount)
        .bind(balance.stable)
        .bind(balance.is_spam)
        .bind(balance.is_testnet)
        .bind(&balance.wallet_address)
        .bind(&balance.token_id)
        .execute(&mut tx)
        .await?;

        inserted += result.rows_affected();
    }

    // Commit the transaction
    tx.commit().await?;

    Ok(inserted as i64)
}

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
pub async fn get_wallet_balances(
    pool: &PostgresPool,
    wallet_address: &str,
    chain_ids: Option<&str>,
    is_spam: Option<bool>,
    is_testnet: Option<bool>,
) -> Result<Vec<WalletBalance>, SqlxError> {
    let mut query_builder = QueryBuilder::new(
        "SELECT timestamp, balance_usd, chain_id, amount, is_spam, is_testnet, wallet_address, token_id
         FROM WalletBalance
         WHERE wallet_address = "
    );

    query_builder.push_bind(wallet_address);
    query_builder.push(" AND is_latest = true");
    query_builder.push(" AND amount != '0'");

    if let Some(spam) = is_spam {
        query_builder.push(" AND is_spam = ");
        query_builder.push_bind(spam);
    } else {
        query_builder.push(" AND is_spam = false");
    }

    match is_testnet {
        Some(false) | None => {
            query_builder.push(" AND is_testnet = false");
        }
        _ => {}
    }

    if let Some(chain_id_str) = chain_ids {
        let chain_id_vec: Vec<i64> =
            chain_id_str.split(',').filter_map(|id| id.parse().ok()).collect();

        if !chain_id_vec.is_empty() {
            query_builder.push(" AND chain_id IN (");
            let mut separated = query_builder.separated(", ");
            for chain_id in chain_id_vec {
                separated.push_bind(chain_id);
            }
            separated.push_unseparated(")");
        }
    } else {
        query_builder.push(" AND chain_id != 0");
    }

    let query = query_builder.build_query_as::<WalletBalance>();
    query.fetch_all(pool).await
}

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
