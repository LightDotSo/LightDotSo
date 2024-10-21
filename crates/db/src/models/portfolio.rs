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
    sqlx::{types::BigDecimal, Error as SqlxError, FromRow},
    PostgresPool,
};
use prisma_client_rust::chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::query_as;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug, Serialize, Deserialize, FromRow)]
pub struct Portfolio {
    #[serde(rename = "timestamp")]
    #[sqlx(rename = "timestamp")]
    pub timestamp: DateTime<Utc>,
    #[serde(rename = "balanceUSD")]
    #[sqlx(rename = "balanceUSD")]
    pub balance_usd: BigDecimal,
}

// -----------------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------------

pub async fn get_portfolio(
    pool: &PostgresPool,
    wallet_address: Address,
) -> Result<Option<Portfolio>, SqlxError> {
    let query = r#"
        SELECT 
            MAX("timestamp") as "timestamp",
            SUM("balanceUSD") as "balanceUSD"
        FROM "WalletBalance"
        WHERE "walletAddress" = $1
          AND "isLatest" = true
        LIMIT 1
    "#;

    query_as::<_, Portfolio>(query)
        .bind(wallet_address.to_checksum(None))
        .fetch_optional(pool)
        .await
}

#[allow(clippy::too_many_arguments)]
#[autometrics]
pub async fn get_portfolio_list(
    pool: &PostgresPool,
    wallet_address: Address,
    chain_ids: Option<&str>,
    interval: &str,
    limit: i32,
) -> Result<Vec<Portfolio>, SqlxError> {
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
        conditions.push("\"chainId\" = 0".to_string());
    }

    let where_clause = conditions.join(" AND ");
    let limit_clause = if limit > 0 { format!("LIMIT {}", limit) } else { String::new() };

    let query_string = format!(
        r#"SELECT 
            date_trunc($1, "timestamp") as "timestamp",
            SUM("balanceUSD") as "balanceUSD"
           FROM "WalletBalance"
           WHERE {where_clause}
           GROUP BY date_trunc($1, "timestamp")
           ORDER BY date_trunc($1, "timestamp") DESC
           {limit_clause}
        "#
    );

    let mut query = sqlx::query_as::<_, Portfolio>(&query_string)
        .bind(interval)
        .bind(wallet_address.to_checksum(None));

    if !chain_id_vec.is_empty() {
        query = query.bind(&chain_id_vec);
    }

    query.fetch_all(pool).await
}
