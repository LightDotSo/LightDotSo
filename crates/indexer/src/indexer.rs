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

use crate::{
    config::IndexerArgs,
    db::{insert, parse_str_u64},
};
use chrono::Utc;
use ethers::types::{Block, TxHash};
use jsonrpsee::core::{
    client::{Subscription, SubscriptionClientT},
    rpc_params,
};
use jsonrpsee_ws_client::{WsClient, WsClientBuilder};
use lightdotso_tracing::tracing::info;
use redb::Database;
use std::sync::Arc;
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

    pub async fn run(&self) -> Result<(), ()> {
        info!("Indexer run, starting");

        // Insert the current time
        // insert(db, &parse_str_u64("time"), &parse_str_u64(Utc::now().to_rfc3339().as_str()))
        //     .unwrap();

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

    #[tokio::test(flavor = "multi_thread")]
    async fn test_config_run() {
        // init(vec![stdout(Level::INFO)]);

        // Set the env vars for anvil
        let node_config = NodeConfig::default();
        let (api, handle) =
            anvil::spawn(node_config.with_blocktime(Some(Duration::from_secs(1)))).await;

        // Check the block number is zero
        let block_num = api.block_number().unwrap();
        assert_eq!(block_num, U256::zero());

        // Set the node configs
        let node_config = NodeConfig::default();
        let http_url = format!("http://localhost:{}", node_config.port).to_string();
        let ws_url = format!("ws://localhost:{}", node_config.port).to_string();

        // Check the websocket provider
        let provider = handle.ws_provider().await;
        let num = provider.get_block_number().await.unwrap();
        assert_eq!(num, block_num.as_u64().into());

        // Set the env vars
        env::set_var("CHAIN_ID", "31337");
        env::set_var("INDEXER_RPC_URL", http_url.clone());
        env::set_var("INDEXER_RPC_WS", ws_url.clone());

        // Initialize the indexer
        let config_args = IndexerArgs::parse();
        let indexer = Indexer::new(&config_args).await;

        // Run the indexer
        // let redb = "indexer.redb";
        // let db = open(redb);
        let indexer_future = indexer.run();

        // Wait for the block number to be 30
        let wait_number_future = async {
            loop {
                let num = provider.get_block_number().await.unwrap();
                if num == U64::from(10) {
                    info!("Block number is 10, exiting");
                    break;
                }
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
            Ok::<(), ()>(())
        };

        tokio::select! {
            _ = indexer_future => {},
            _ = wait_number_future => {},
        }
    }
}
