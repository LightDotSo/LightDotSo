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
use prisma_client_rust::NewClientError;

/// Create a new Prisma client.
pub async fn create_client() -> Result<PrismaClient, NewClientError> {
    let client: Result<PrismaClient, NewClientError> = PrismaClient::_builder().build().await;

    client
}

/// Create a new Prisma client w/ `POSTGRES_URL` environment variable.
pub async fn create_postgres_client() -> Result<PrismaClient, NewClientError> {
    let client: Result<PrismaClient, NewClientError> =
        PrismaClient::_builder().with_url(std::env::var("POSTGRES_URL").unwrap()).build().await;

    client
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
