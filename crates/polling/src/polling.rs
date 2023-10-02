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

use crate::config::PollingArgs;
use axum::Json;
use backon::{BlockingRetryable, ExponentialBuilder, Retryable};
use eyre::Result;
use lightdotso_constants::TESTNET_CHAIN_IDS;
use lightdotso_db::{
    db::{create_client, create_wallet},
    error::DbError,
};
use lightdotso_graphql::{
    constants::THE_GRAPH_HOSTED_SERVICE_URLS,
    polling::light_wallets::{
        run_light_wallets_query, BigInt, GetLightWalletsQueryVariables, LightWallet,
    },
};
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::{error, info};
use std::{sync::Arc, time::Duration};

#[derive(Clone)]
pub struct Polling {}

impl Polling {
    pub async fn new(_args: &PollingArgs) -> Self {
        info!("Polling new, starting");

        // Create the polling
        Self {}
    }

    #[tokio::main]
    pub async fn run(&self) {
        info!("Polling run, starting");

        let mut handles = Vec::new();

        // Get the chain ids from the constants which is the keys of the
        // THE_GRAPH_HOSTED_SERVICE_URLS map.
        let chain_ids: Vec<u64> = THE_GRAPH_HOSTED_SERVICE_URLS.keys().cloned().collect();

        // Spawn a task for each chain id.
        for chain_id in chain_ids {
            let handle = tokio::spawn(run_polling_task(chain_id));
            handles.push(handle);
        }

        // Wait for all tasks to finish.
        for handle in handles {
            if let Err(e) = handle.await {
                error!("A task panicked: {:?}", e);
            }
        }
    }
}

async fn run_polling_task(chain_id: u64) {
    let mut min_block = 0;

    loop {
        // Wrap the task in a catch_unwind block to not crash the task if the task panics.
        let result = poll_task(chain_id, min_block).await;

        match result {
            Ok(block) => {
                let now = chrono::Utc::now();
                info!("Polling run, chain_id: {} timestamp: {}", chain_id, now);

                // On success, set the min block to the returned block.
                min_block = block;

                // Sleep for 1 second.
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
            Err(e) => {
                error!("run_task {} panicked: {:?}", chain_id, e);

                // Retry the task after 1 second.
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
        }
    }
}

async fn poll_task(chain_id: u64, mut min_block: i32) -> Result<i32> {
    // Get the light wallet data, spawn a blocking task to not block the tokio runtime thread used
    // by the underlying reqwest client. (blocking)
    let light_wallet = tokio::task::spawn_blocking(move || {
        {
            || {
                run_light_wallets_query(
                    chain_id,
                    GetLightWalletsQueryVariables {
                        min_block: BigInt(min_block.to_string()),
                        min_index: BigInt("0".to_string()),
                    },
                )
            }
        }
        .retry(&ExponentialBuilder::default())
        .call()
    })
    .await?;

    let data = light_wallet?.data;

    if let Some(d) = data {
        let meta = d._meta;

        // Set the min block to the returned block.
        if let Some(m) = meta {
            min_block = m.block.number;
        }

        let wallets = d.light_wallets;

        if !wallets.is_empty() {
            for (index, wallet) in wallets.iter().enumerate() {
                info!("Polling run, chain_id: {} wallet: {:?}", chain_id, wallet);

                // Create to db if the wallet has a image_hash
                if let Some(hash) = &wallet.image_hash {
                    if !hash.0.is_empty() {
                        // Create the db client
                        let db = Arc::new(create_client().await.unwrap());

                        // Parse the image hash to a string.
                        let image_hash: String = hash.0.parse().unwrap();

                        // Create the wallet in the db.
                        let _ = db_create_wallet(db, wallet, &image_hash, chain_id).await;
                    }
                }

                if index == wallets.len() - 1 {
                    // Return the minimum block number for the last wallet.
                    return Ok(wallet.block_number.0.parse().unwrap_or(min_block));
                }
            }
        }
    }

    Ok(min_block)
}

pub async fn db_create_wallet(
    db_client: Arc<PrismaClient>,
    wallet: &LightWallet,
    hash: &str,
    chain_id: u64,
) -> Result<Json<lightdotso_prisma::wallet::Data>, DbError> {
    {
        || {
            create_wallet(
                db_client.clone(),
                wallet.address.0.parse().unwrap(),
                chain_id as i64,
                wallet.factory.0.parse().unwrap(),
                hash.to_string(),
                // wallet.clone().image_hash.unwrap().0.parse().unwrap(),
                Some(TESTNET_CHAIN_IDS.contains(&chain_id)),
            )
        }
    }
    .retry(&ExponentialBuilder::default())
    .await
}
