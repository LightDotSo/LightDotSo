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
    sqlx::{query_as, types::BigDecimal, Error as SqlxError, FromRow},
    PostgresPool,
};
use prisma_client_rust::chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

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
    pub balance_usd: BigDecimal,
    #[serde(rename = "chainId")]
    #[sqlx(rename = "chainId")]
    pub chain_id: BigDecimal,
    #[serde(rename = "amount")]
    #[sqlx(rename = "amount")]
    pub amount: BigDecimal,
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
    #[serde(rename = "tokenGroupId")]
    #[sqlx(rename = "tokenGroupId")]
    pub token_group_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------------

#[allow(clippy::too_many_arguments)]
#[autometrics]
pub async fn get_wallet_balances(
    pool: &PostgresPool,
    wallet_address: &str,
    chain_ids: Option<&str>,
    is_spam: Option<bool>,
    is_testnet: Option<bool>,
    is_group_only: Option<bool>,
    interval: &str,
    limit: i32,
    skip: i32,
) -> Result<Vec<WalletBalance>, SqlxError> {
    let mut conditions = Vec::new();
    let mut param_count = 2;

    conditions.push("\"walletAddress\" = $2".to_string());
    conditions.push("\"isLatest\" = true".to_string());

    let chain_id_vec: Vec<i64> = chain_ids
        .map(|chain_id_str| chain_id_str.split(',').filter_map(|id| id.parse().ok()).collect())
        .unwrap_or_default();

    if !chain_id_vec.is_empty() {
        param_count += 1;
        conditions.push(format!("\"chainId\" = ANY(${})", param_count));
    } else {
        conditions.push("\"chainId\" != 0".to_string());
    }

    if is_spam == Some(false) || is_spam.is_none() {
        conditions.push("\"isSpam\" = false".to_string());
    }

    if is_testnet == Some(false) || is_testnet.is_none() {
        conditions.push("\"isTestnet\" = false".to_string());
    }

    if is_group_only == Some(true) {
        conditions.push("\"tokenGroupId\" IS NOT NULL".to_string());
    }

    let where_clause = conditions.join(" AND ");
    let amount_clause = "\"amount\" > 0".to_string();
    let balance_usd_clause = "\"balanceUSD\" > 0".to_string();

    let limit_clause = if limit > 0 { format!("LIMIT {}", limit) } else { String::new() };
    let offset_clause = if skip > 0 { format!("OFFSET {}", skip) } else { String::new() };

    let query_string = format!(
        r#"SELECT 
            "timestamp",
            "balanceUSD",
            "chainId",
            "amount",
            "isSpam",
            "isTestnet",
            "walletAddress",
            "tokenId",
            "tokenGroupId"
           FROM "WalletBalance"
           WHERE {where_clause}
             AND {amount_clause}
             AND {balance_usd_clause}
           ORDER BY "timestamp" DESC
           {limit_clause}
           {offset_clause}
        "#
    );

    let mut query =
        sqlx::query_as::<_, WalletBalance>(&query_string).bind(interval).bind(wallet_address);

    if !chain_id_vec.is_empty() {
        query = query.bind(&chain_id_vec);
    }

    query.fetch_all(pool).await
}

#[autometrics]
pub async fn get_wallet_balances_count(
    pool: &PostgresPool,
    wallet_address: &str,
    chain_ids: Option<&str>,
    is_spam: Option<bool>,
    is_testnet: Option<bool>,
    is_group_only: Option<bool>,
    interval: &str,
) -> Result<i64, SqlxError> {
    let mut conditions = Vec::new();
    let mut param_count = 2;

    conditions.push("\"walletAddress\" = $2".to_string());
    conditions.push("\"isLatest\" = true".to_string());

    let chain_id_vec: Vec<i64> = chain_ids
        .map(|chain_id_str| chain_id_str.split(',').filter_map(|id| id.parse().ok()).collect())
        .unwrap_or_default();

    if !chain_id_vec.is_empty() {
        param_count += 1;
        conditions.push(format!("\"chainId\" = ANY(${})", param_count));
    } else {
        conditions.push("\"chainId\" != 0".to_string());
    }

    if is_spam == Some(false) || is_spam.is_none() {
        conditions.push("\"isSpam\" = false".to_string());
    }

    if is_testnet == Some(false) || is_testnet.is_none() {
        conditions.push("\"isTestnet\" = false".to_string());
    }

    if is_group_only == Some(true) {
        conditions.push("\"tokenGroupId\" IS NOT NULL".to_string());
    }

    let where_clause = conditions.join(" AND ");
    let amount_clause = r#""amount" > 0"#.to_string();
    let balance_usd_clause = r#""balanceUSD" > 0"#.to_string();

    let query_string = format!(
        r#"SELECT 
            COUNT(*)
           FROM "WalletBalance"
           WHERE {where_clause}
             AND {amount_clause}
             AND {balance_usd_clause}
        "#
    );

    let mut query = sqlx::query_scalar::<_, i64>(&query_string).bind(interval).bind(wallet_address);

    if !chain_id_vec.is_empty() {
        query = query.bind(&chain_id_vec);
    }

    query.fetch_one(pool).await
}

#[autometrics]
pub async fn get_latest_wallet_balance_for_token(
    pool: &PostgresPool,
    token_id: String,
    wallet_address: Address,
) -> Result<Option<WalletBalance>, SqlxError> {
    let query = r#"
        SELECT "timestamp", "balanceUSD", "chainId", "amount", "isSpam","isTestnet", "walletAddress", "tokenId", "tokenGroupId"
        FROM "WalletBalance"
        WHERE "tokenId" = $1
          AND "walletAddress" = $2
          AND "isLatest" = true
        ORDER BY timestamp DESC
        LIMIT 1
    "#;

    query_as::<_, WalletBalance>(query)
        .bind(token_id)
        .bind(wallet_address.to_checksum(None))
        .fetch_optional(pool)
        .await
}

#[autometrics]
pub async fn get_latest_wallet_balances_for_token_group(
    pool: &PostgresPool,
    token_group_id: String,
    wallet_address: Address,
) -> Result<Vec<WalletBalance>, SqlxError> {
    let query = r#"
        SELECT "timestamp", "balanceUSD", "chainId", "amount", "isSpam", "isTestnet", "walletAddress", "tokenId", "tokenGroupId"
        FROM "WalletBalance"
        WHERE "tokenGroupId" = $1
          AND "walletAddress" = $2
          AND "isLatest" = true
        ORDER BY timestamp DESC
        LIMIT 1
    "#;

    query_as::<_, WalletBalance>(query)
        .bind(token_group_id)
        .bind(wallet_address.to_checksum(None))
        .fetch_all(pool)
        .await
}

#[autometrics]
pub async fn get_latest_wallet_balances_for_token_groups(
    pool: &PostgresPool,
    token_group_ids: Vec<String>,
    wallet_address: Address,
) -> Result<Vec<WalletBalance>, SqlxError> {
    let query = r#"
        SELECT "timestamp", "balanceUSD", "chainId", "amount", "isSpam", "isTestnet", "walletAddress", "tokenId", "tokenGroupId"
        FROM "WalletBalance"
        WHERE "tokenGroupId" = ANY($1)
          AND "walletAddress" = $2
          AND "isLatest" = true
    "#;

    query_as::<_, WalletBalance>(query)
        .bind(&token_group_ids)
        .bind(wallet_address.to_checksum(None))
        .fetch_all(pool)
        .await
}
