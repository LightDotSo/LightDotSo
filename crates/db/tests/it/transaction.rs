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

use ethers::providers::Middleware;
use ethers_main::types::{H160, H256};
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
    let _ = dotenvy::dotenv();

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
    let _ = dotenvy::dotenv();

    // Create a database client.
    let db = create_test_client().await?;

    // Get the provider.
    let provider = get_provider(1).await?;

    // Set the tx hash.
    let tx_hash =
        H256::from_str("0xf8af7ce87505ad4611ec3beaf3f0f70ca4c73dff544347fac5fcf198b4e73ed0")?;

    // Get a transaction with logs.
    let tx = provider.get_transaction(tx_hash).await?;

    // Get the transaction with logs.
    let tx_with_receipt = provider.get_transaction_receipt(tx_hash).await?;

    // Get the block number.
    let block = provider.get_block(18917135).await?;

    // Wallet address.
    let wallet_address: H160 = "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F".parse()?;

    // Upsert the transaction with log receipt.
    let res = upsert_transaction_with_log_receipt(
        db.into(),
        wallet_address,
        tx.clone().unwrap(),
        tx_with_receipt.clone().unwrap().logs,
        tx_with_receipt.clone().unwrap(),
        1,
        block.clone().unwrap().timestamp,
        None,
    )
    .await?;

    // Print the result.
    println!("{:?}", res);

    Ok(())
}
