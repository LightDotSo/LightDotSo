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
    sqlx::{query, query_as, types::BigDecimal, Error as SqlxError, FromRow, QueryBuilder},
    PostgresPool,
};
use prisma_client_rust::chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Debug)]
pub struct CreateWalletBalanceParams {
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
    params: Vec<CreateWalletBalanceParams>,
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
    for balance in params {
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

#[derive(Clone, Debug, Serialize, Deserialize, FromRow)]
pub struct WalletBalance {
    #[serde(rename = "timestamp")]
    #[sqlx(rename = "timestamp")]
    pub timestamp: DateTime<Utc>,
    #[serde(rename = "balanceUSD")]
    #[sqlx(rename = "balanceUSD")]
    pub balance_usd: f64,
    #[serde(rename = "chainId")]
    #[sqlx(rename = "chainId")]
    pub chain_id: BigDecimal,
    #[serde(rename = "amount")]
    #[sqlx(rename = "amount")]
    pub amount: Option<String>,
    #[serde(rename = "isSpam")]
    #[sqlx(rename = "isSpam")]
    pub is_spam: bool,
    #[serde(rename = "isTestnet")]
    #[sqlx(rename = "isTestnet")]
    pub is_testnet: bool,
    #[serde(rename = "walletAddress")]
    #[sqlx(rename = "walletAddress")]
    pub wallet_address: String,
    #[serde(rename = "tokenId")]
    #[sqlx(rename = "tokenId")]
    pub token_id: String,
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
        SELECT "timestamp", "balanceUSD", "chainId", "amount", "isSpam", "isTestnet", "walletAddress", "tokenId"
        FROM "WalletBalance"
        WHERE "tokenId" = $1
        ORDER BY "timestamp" DESC
        LIMIT 1
    "#;

    query_as::<_, WalletBalance>(query)
        .bind(token_id)
        .bind(wallet_address.to_checksum(None))
        .fetch_optional(pool)
        .await
}
