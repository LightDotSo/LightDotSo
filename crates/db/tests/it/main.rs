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

#![recursion_limit = "512"]

use dotenvy::dotenv;
use eyre::Result;
use lightdotso_db::db::{create_client, create_postgres_client, create_test_client};
use lightdotso_sqlx::sqlx::query;
use prisma_client_rust::Raw;
use serde_json::Value;

mod interpretation;
mod transaction;
mod user_operation;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_create_client() -> Result<()> {
    // Create a new test client
    let client = create_client().await?;

    // Run a simple query
    let result: Vec<Value> =
        client._query_raw(Raw::new("SELECT 1 AS value", vec![])).exec().await?;
    println!("{:?}", result);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_create_postgres_client() -> Result<()> {
    // Create a new postgres test client
    let client = create_postgres_client().await?;

    // Run a simple query
    let result = query("SELECT 1").execute(&client).await?;
    println!("{:?}", result);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_create_test_client() -> Result<()> {
    // Load dotenv
    let _ = dotenv();

    // Create a new test client
    let client = create_test_client().await?;

    // Run a simple query
    let result: Vec<Value> =
        client._query_raw(Raw::new("SELECT 1 AS value", vec![])).exec().await?;
    println!("{:?}", result);

    Ok(())
}
