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

#![allow(clippy::unwrap_used)]

use eyre::Result;
use lightdotso_prisma::PrismaClient;
use prisma_client_rust::NewClientError;

/// Create a new Prisma client.
pub async fn create_client() -> Result<PrismaClient, NewClientError> {
    let client: Result<PrismaClient, NewClientError> = PrismaClient::_builder().build().await;

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
