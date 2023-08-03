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
use crate::{config::IndexerArgs, db::ReDb};
use chrono::Utc;
use ethers::types::{Block, TxHash};
use jsonrpsee::core::{
    client::{Subscription, SubscriptionClientT},
    rpc_params,
};
use jsonrpsee_ws_client::{WsClient, WsClientBuilder};
use std::sync::Arc;
use tracing::info;

#[derive(Debug, Clone)]
pub struct Indexer {
    ws_client: Arc<WsClient>,
}

impl Indexer {
    pub async fn new(args: &IndexerArgs) -> Self {
        info!("Indexer new, starting");

        let ws_client = WsClientBuilder::default()
            .build(&args.ws)
            .await
            .expect("Failed to connect to the websocket endpoint");

        // Create the indexer
        Self { ws_client: Arc::new(ws_client) }
    }

    pub async fn run(&self, db: &mut ReDb) -> Result<(), ()> {
        info!("Indexer run, starting");

        // Insert the current time
        db.write("time", Utc::now().to_rfc3339().as_str()).unwrap();

        // From: https://github.com/matter-labs/zksync-era/blob/e575ec101fe88627ab541a52464ab5025c16e6b4/core/tests/cross_external_nodes_checker/src/pubsub_checker.rs#L103
        // License: Apache-2.0, MIT
        // Get the latest block
        let params = rpc_params!["newHeads"];
        let mut subscription: Subscription<Block<TxHash>> = self
            .ws_client
            .subscribe("eth_subscribe", params, "eth_unsubscribe")
            .await
            .expect("Failed to subscribe to newHeads");

        // Loop over the blocks
        while let Some(block) = subscription.next().await {
            if block.is_err() {
                continue;
            }
            info!("New block: {:?}", block.unwrap().clone().number);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    // use crate::db::open;
    use anvil::NodeConfig;
    use clap::Parser;
    use ethers::{
        prelude::Middleware,
        types::{U256, U64},
    };
    use lightdotso_tracing::tracing::info;
    use std::{env, time::Duration};
    use tokio::{task, time::sleep};
    use tracing_test::traced_test;

    async fn task_one() -> String {
        sleep(Duration::from_secs(3)).await;
        println!("Task one completed!");
        String::from("Result from task one!")
    }

    async fn task_two() -> String {
        sleep(Duration::from_secs(5)).await;
        println!("Task two completed!");
        String::from("Result from task two!")
    }

    #[tokio::test(flavor = "multi_thread")]
    async fn test_task_spawn() {
        let t1 = task::spawn(task_one());
        let t2 = task::spawn(task_two());

        tokio::select! {
            result = t1 => {
                println!("{}", result.unwrap());
            },
            result = t2 => {
                println!("{}", result.unwrap());
            },
        }
    }

    #[traced_test]
    #[tokio::test(flavor = "multi_thread")]
    async fn test_config_run() {
        // Set the env vars for anvil
        let node_config = NodeConfig::default();
        let (api, handle) = anvil::spawn(
            // Run the node with a blocktime of 1 second w/o tracing
            node_config.clone().with_blocktime(Some(Duration::from_secs(1))).with_tracing(false),
        )
        .await;

        // Check the block number is zero
        let block_num = api.block_number().unwrap();
        assert_eq!(block_num, U256::zero());

        // Set the node configs
        let http_url = format!("http://localhost:{}", node_config.clone().port).to_string();
        let ws_url = format!("ws://localhost:{}", node_config.clone().port).to_string();

        // Check the websocket provider
        let provider = handle.ws_provider().await;
        let num = provider.get_block_number().await.unwrap();
        assert_eq!(num, block_num.as_u64().into());

        // Set the env vars
        env::set_var("CHAIN_ID", "31337");
        env::set_var("INDEXER_RPC_URL", http_url.clone());
        env::set_var("INDEXER_RPC_WS", ws_url.clone());

        // Initialize the indexer
        let config_args = IndexerArgs::parse_from([""]);
        let indexer = Indexer::new(&config_args).await;

        // Create the indexer future w/ the db
        let db = Arc::new(tokio::sync::Mutex::new(ReDb::new("indsexer.redb")));
        let db_ref_for_indexer = Arc::clone(&db);
        let db_ref_for_provider = Arc::clone(&db);

        let indexer_future = task::spawn(async move {
            let mut guarded_db = db_ref_for_indexer.lock().await;
            indexer.run(&mut guarded_db).await
        });

        // Wait for the block number to be 30
        let wait_number_future = task::spawn(async move {
            info!("Waiting for block number to be 30");
            loop {
                let num = provider.get_block_number().await.unwrap();
                info!("Block number: {}", num);
                if num == U64::from(10) {
                    info!("Block number is 10, exiting");
                    break;
                }
                // {
                //     let mut guarded_db = db_ref_for_provider.lock().await;
                //     let _ = guarded_db.write("block", &num.to_string());
                // }
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
            Ok::<(), ()>(())
        });

        // Run the futures in parallel
        tokio::select! {
            result = indexer_future => {
                println!("{:?}", result.unwrap());
            },
            result = wait_number_future => {
                println!("{:?}", result.unwrap());
            },
        }
    }
}
