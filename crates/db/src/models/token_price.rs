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
        query, query_as, Error as SqlxError, FromRow, Row,
    },
    PostgresPool,
};
use prisma_client_rust::chrono::{DateTime, Utc};

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

/// Create a new token price
#[autometrics]
pub async fn create_token_price(
    pool: &PostgresPool,
    chain_id: i64,
    token_address: Address,
    price: f64,
) -> Result<()> {
    let token_address_str = format!("{:?}", token_address);

    query("INSERT INTO token_prices (chain_id, token_address, price) VALUES ($1, $2, $3)")
        .bind(chain_id)
        .bind(token_address_str)
        .bind(price)
        .execute(pool)
        .await?;

    Ok(())
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug)]
pub struct TokenPriceAggregate {
    pub price: f64,
    pub date: DateTime<Utc>,
}

impl<'r> FromRow<'r, postgres::PgRow> for TokenPriceAggregate {
    fn from_row(row: &'r postgres::PgRow) -> Result<Self, SqlxError> {
        Ok(TokenPriceAggregate { price: row.try_get("price")?, date: row.try_get("date")? })
    }
}

// -----------------------------------------------------------------------------
// Get
// -----------------------------------------------------------------------------

#[autometrics]
pub async fn get_token_prices(
    pool: &PostgresPool,
    token_id: String,
    interval: &str,
    limit: i32,
) -> Result<Vec<TokenPriceAggregate>, SqlxError> {
    let query = format!(
        "SELECT AVG(price) as price, time_bucket('{}', timestamp) as date
         FROM TokenPrice
         WHERE tokenId = $1
         GROUP BY time_bucket('{}', timestamp)
         ORDER BY date DESC
         LIMIT $2",
        interval, interval
    );

    query_as::<_, TokenPriceAggregate>(&query).bind(token_id).bind(limit).fetch_all(pool).await
}
