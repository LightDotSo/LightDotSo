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

use anvil::NodeConfig;
use clap::Parser;
use ethers::types::{U256, U64};
use lightdotso_indexer::{config::IndexerArgs, indexer::Indexer};
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::info;
use std::{env, sync::Arc, time::Duration};
use tracing_test::traced_test;

#[traced_test]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_indexer() {
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
    env::set_var(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:6500/neon?schema=public",
    );
    env::set_var("INDEXER_RPC_URL", http_url.clone());
    env::set_var("INDEXER_RPC_WS", ws_url.clone());

    // Initialize the indexer
    let config_args = IndexerArgs::parse_from([""]);
    let indexer = Indexer::new(&config_args).await;

    // Set the mocked db client
    let (client, _mock) = PrismaClient::_mock();

    // Run the indexer
    let indexer_future = indexer.run(Arc::new(client));

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
