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

use alloy::{
    eips::BlockNumberOrTag,
    primitives::{Address, B256},
    providers::Provider,
};
use dotenvy::dotenv;
use eyre::Result;
use lightdotso_contracts::provider::get_provider;
use lightdotso_db::{
    db::create_test_client,
    models::transaction::{get_transaction_with_logs, upsert_transaction_with_log_receipt},
};
use std::{str::FromStr, sync::Arc};

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_get_transaction_with_logs() -> Result<()> {
    // Load the environment variables.
    let _ = dotenv();

    // Create a database client.
    let db = create_test_client().await?;

    // Get a transaction with logs.
    let tx = get_transaction_with_logs(
        Arc::new(db),
        "0x0eba351b13320cf51b42e5218e63c90698ba73bceb65e5a38f146685fe1407fa".parse()?,
    )
    .await?;

    // Print the transaction.
    println!("{:?}", tx);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_upsert_transaction_with_log_receipt() -> Result<()> {
    // Load the environment variables.
    let _ = dotenv();

    // Create a database client.
    let db = create_test_client().await?;

    // Get the provider.
    let (provider, _) = get_provider(1).await?;

    // Set the tx hash.
    let tx_hash =
        B256::from_str("0xf8af7ce87505ad4611ec3beaf3f0f70ca4c73dff544347fac5fcf198b4e73ed0")?;

    // Get a transaction with logs.
    let tx = provider.get_transaction_by_hash(tx_hash).await?;

    // Get the transaction with logs.
    let tx_with_receipt = provider.get_transaction_receipt(tx_hash).await?;

    // Get the block number.
    let block = provider.get_block_by_number(BlockNumberOrTag::Number(18917135), true).await?;

    // Wallet address.
    let wallet_address: Address = "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F".parse()?;

    // Upsert the transaction with log receipt.
    let res = upsert_transaction_with_log_receipt(
        db.into(),
        wallet_address,
        tx.clone().unwrap(),
        tx_with_receipt.clone().unwrap().inner.logs().to_vec(),
        tx_with_receipt.clone().unwrap(),
        1,
        block.clone().unwrap().header.timestamp,
        None,
    )
    .await?;

    // Print the result.
    println!("{:?}", res);

    Ok(())
}
