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

use crate::{config::IndexerArgs, constants::FACTORY_ADDRESSES};
use ethers::types::{
    Action::{Call, Create, Reward, Suicide},
    ActionType, Block, Trace, TxHash,
};
use jsonrpsee::core::{
    client::{ClientT, Subscription, SubscriptionClientT},
    rpc_params,
};
use jsonrpsee_http_client::{transport::HttpBackend, HttpClient, HttpClientBuilder};
use jsonrpsee_ws_client::{WsClient, WsClientBuilder};
use lightdotso_tracing::tracing::{debug, error, info};
use serde_json::Value;
use std::{sync::Arc, time::Duration};

#[derive(Debug, Clone)]
pub struct Indexer {
    http_client: HttpClient<HttpBackend>,
    ws_client: Arc<WsClient>,
}

impl Indexer {
    pub async fn new(args: &IndexerArgs) -> Self {
        info!("Indexer new, starting");

        let http_client = HttpClientBuilder::default()
            .max_concurrent_requests(100000)
            .request_timeout(Duration::from_secs(30))
            .build(&args.rpc)
            .unwrap();

        let ws_client = WsClientBuilder::default()
            .build(&args.ws)
            .await
            .expect("Failed to connect to the websocket endpoint");

        // Create the indexer
        Self { http_client, ws_client: Arc::new(ws_client) }
    }

    pub async fn run(&self) {
        info!("Indexer run, starting");

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

            // Get the block number
            let block_number = block.unwrap().number.unwrap();
            info!("New block: {:?}", block_number.clone());
            let traced_block = self.get_traced_block(block_number.as_u64()).await;

            // Filter the traces
            let created_traces: Vec<&Trace> = traced_block
                .iter()
                .filter(|trace| match &trace.action {
                    Call(_) => false,
                    Create(res) => FACTORY_ADDRESSES.contains(&res.from),
                    Reward(_) | Suicide(_) => false,
                })
                .collect();

            // Loop over the traces
            for trace in created_traces {
                if let Create(res) = &trace.action {
                    info!("New created trace: {:?}", res);
                    info!("New init trace: {:?}", res.init)
                }
            }

            // Filter the called traces
            let called_traces: Vec<&Trace> =
                traced_block.iter().filter(|trace| trace.action_type == ActionType::Call).collect();

            // Loop over the called traces
            for _ in called_traces {
                // info!("New called trace: {:?}", trace);
            }
        }
    }

    pub async fn get_traced_block(&self, block_number: u64) -> Vec<Trace> {
        // Get the traced block
        let raw_block: Result<Value, _> = self
            .http_client
            .to_owned()
            .request("trace_block", rpc_params![format!("0x{:x}", block_number)])
            .await;

        // Depending on the result, execute logic
        match raw_block {
            Ok(block) => {
                debug!("Traced block: {:?}", block);

                // Parse the block
                let traces: Result<Vec<Trace>, _> = serde_json::from_value(block);

                // Depending on the result, execute logic
                match traces {
                    Ok(traces) => {
                        debug!("Traces: {:?}", traces);
                        traces
                    }
                    Err(e) => {
                        // Return an empty vector on error
                        error!("Failed to parse traces: {:?}", e);
                        vec![]
                    }
                }
            }
            Err(e) => {
                // Return an empty vector on error
                error!("Failed to trace block: {:?}", e);
                vec![]
            }
        }
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
    use tracing_test::traced_test;

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
        let config_args = IndexerArgs::parse_from([""]);
        let indexer = Indexer::new(&config_args).await;

        // Run the indexer
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
        };

        tokio::select! {
            _ = indexer_future => {},
            _ = wait_number_future => {},
        }

        logs_contain("Block number is 10, exiting");
    }
}
