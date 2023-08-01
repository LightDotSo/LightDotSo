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

use anyhow::Result;
use clap::Parser;
use lightdotso_tracing::tracing::info;

#[derive(Debug, Clone, Parser, Default)]
pub struct IndexerArgs {
    /// The chain id of the chain to index.
    #[arg(long, short, default_value_t = 1)]
    #[clap(long, env)]
    pub chain_id: usize,
    /// The RPC endpoint to connect to.
    #[arg(long, short, default_value_t = String::from(""))]
    #[clap(long, env = "INDEXER_RPC_URL")]
    pub rpc: String,
    /// The websocket RPC endpoint to connect to.
    #[arg(long, short, default_value_t = String::from(""))]
    #[clap(long, env = "INDEXER_RPC_WS")]
    pub ws: String,
    /// The number of blocks of the batch to index.
    #[arg(long, short, default_value_t = 1)]
    #[clap(long, env)]
    pub batch_size: usize,
    /// The start block to index.
    #[arg(long, short, default_value_t = 0)]
    #[clap(long, env)]
    pub start_block: u64,
    /// The end block to index.
    #[arg(long, short, default_value_t = 0)]
    #[clap(long, env)]
    pub end_block: u64,
}

impl IndexerArgs {
    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("IndexerArgs run, exiting");

        let db = sled::open("sled")?;
        db.insert("my_key", "my_value")?;

        // Print the config
        info!("Config: {:?}", self);

        // Return success
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_config_values() {
        // Reset the env vars
        env::remove_var("CHAIN_ID");
        env::remove_var("INDEXER_RPC_URL");
        env::remove_var("INDEXER_RPC_WS");

        // Create a Config with default values
        let config_args = IndexerArgs::parse();

        // Verify the default values
        assert_eq!(config_args.chain_id, 1);
        assert_eq!(config_args.rpc, "");
        assert_eq!(config_args.ws, "");
        assert_eq!(config_args.batch_size, 1);
        assert_eq!(config_args.start_block, 0);
        assert_eq!(config_args.end_block, 0);

        // Set some env vars
        env::set_var("CHAIN_ID", "5");
        env::set_var("INDEXER_RPC_URL", "rpc");
        env::set_var("INDEXER_RPC_WS", "ws");

        // Create a Config with env values
        let config_args = IndexerArgs::parse();

        // Verify the new values from env
        assert_eq!(config_args.chain_id, 5);
        assert_eq!(config_args.rpc, "rpc");
        assert_eq!(config_args.ws, "ws");

        // Reset the env vars
        env::remove_var("CHAIN_ID");
        env::remove_var("INDEXER_RPC_URL");
        env::remove_var("INDEXER_RPC_WS");
    }

    #[test]
    fn test_config_default_values() {
        // Create a Config with default values
        let config_args = IndexerArgs::default();

        // Verify the default values
        assert_eq!(config_args.chain_id, 0);
        assert_eq!(config_args.rpc, "");
        assert_eq!(config_args.ws, "");
        assert_eq!(config_args.batch_size, 0);
        assert_eq!(config_args.start_block, 0);
        assert_eq!(config_args.end_block, 0);
    }
}
