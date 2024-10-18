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

#![allow(clippy::unwrap_used)]

use eyre::Result;
use lightdotso_prisma::PrismaClient;
use lightdotso_sqlx::{
    sqlx::{postgres::PgPoolOptions, Error as SqlxError},
    PostgresPool,
};
use prisma_client_rust::NewClientError;

/// Create a new Prisma client.
pub async fn create_client() -> Result<PrismaClient, NewClientError> {
    // If the `NEXTEST` environment variable is set, use the test database.
    // Otherwise, use the `DATABASE_URL` environment variable.
    if std::env::var("NEXTEST").is_ok() {
        return PrismaClient::_builder()
            .with_url("mysql://dev:dev@localhost:3306/lightdotso".to_owned())
            .build()
            .await;
    }

    // Create a new Prisma client.
    // Default to the `DATABASE_URL` environment variable.
    let client: Result<PrismaClient, NewClientError> = PrismaClient::_builder().build().await;

    // Return the client.
    client
}

/// Create a new sqlx client w/ `POSTGRES_URL` environment variable.
pub async fn create_postgres_client() -> Result<PostgresPool, SqlxError> {
    // If the `NEXTEST` environment variable is set, use the test database.
    // Otherwise, use the `POSTGRES_URL` environment variable.
    let database_url = if std::env::var("NEXTEST").is_ok() {
        "postgres://testuser:testpassword@localhost:5432/testdb"
    } else {
        &std::env::var("POSTGRES_URL").unwrap()
    };

    // Create a new sqlx client.
    let pool = PgPoolOptions::new().max_connections(5).connect(database_url).await?;

    // Return the client.
    Ok(pool)
}

/// Create a new Prisma client for testing.
/// Reads the `DATABASE_TEST_URL` environment variable.
/// Fallbacks to `DATABASE_URL` if `DATABASE_TEST_URL` is not set.
pub async fn create_test_client() -> Result<PrismaClient, NewClientError> {
    let client: Result<PrismaClient, NewClientError> = PrismaClient::_builder()
        .with_url(
            std::env::var("DATABASE_TEST_URL")
                .unwrap_or_else(|_| std::env::var("DATABASE_URL").unwrap()),
        )
        .build()
        .await;

    client
}
