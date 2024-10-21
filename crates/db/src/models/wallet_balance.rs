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
    sqlx::{query_as, types::BigDecimal, Error as SqlxError, FromRow, QueryBuilder},
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
        r#"SELECT "timestamp", "balanceUSD", "chainId", "amount", "isSpam", "isTestnet", "walletAddress", "tokenId"
           FROM "WalletBalance"
           WHERE "walletAddress" = "#,
    );

    query_builder.push_bind(wallet_address);
    query_builder.push(r#" AND "isLatest" = true"#);
    query_builder.push(r#" AND "amount" != '0'"#);

    if let Some(spam) = is_spam {
        query_builder.push(r#" AND "isSpam" = "#);
        query_builder.push_bind(spam);
    } else {
        query_builder.push(r#" AND "isSpam" = false"#);
    }

    match is_testnet {
        Some(false) | None => {
            query_builder.push(r#" AND "isTestnet" = false"#);
        }
        _ => {}
    }

    if let Some(chain_id_str) = chain_ids {
        let chain_id_vec: Vec<i64> =
            chain_id_str.split(',').filter_map(|id| id.parse().ok()).collect();

        if !chain_id_vec.is_empty() {
            query_builder.push(r#" AND "chainId" IN ("#);
            let mut separated = query_builder.separated(", ");
            for chain_id in chain_id_vec {
                separated.push_bind(chain_id);
            }
            separated.push_unseparated(")");
        }
    } else {
        query_builder.push(r#" AND "chainId" != 0"#);
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
