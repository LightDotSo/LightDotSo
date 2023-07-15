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

use clap::Parser;
use lightdotso_tracing::tracing::info;
use std::env;

#[derive(Parser, Debug)]
pub struct ConfigArgs {
    /// The chain id of the chain to index.
    #[arg(long, short, default_value_t = 1)]
    pub chain_id: usize,
    /// The RPC endpoint to connect to.
    #[arg(long, short, default_value_t = String::from(""))]
    pub rpc: String,
    /// The websocket RPC endpoint to connect to.
    #[arg(long, short, default_value_t = String::from(""))]
    pub ws: String,
    /// The number of blocks of the batch to index.
    #[arg(long, short, default_value_t = 1)]
    pub batch_size: usize,
    /// The start block to index.
    #[arg(long, short, default_value_t = 0)]
    pub start_block: u64,
    /// The end block to index.
    #[arg(long, short, default_value_t = 0)]
    pub end_block: u64,
}

impl ConfigArgs {
    pub async fn run(&self) -> eyre::Result<()> {
        // Add info
        info!("ConfigArgs run, exiting");

        // Print the config
        info!("Config: {:?}", self);

        // Return success
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    // The chain id of the chain to index.
    pub chain_id: usize,
    // The number of blocks of the batch to index.
    pub batch_size: usize,
    // The start block to index.
    pub start_block: u64,
    // The end block to index.
    pub end_block: u64,
}

impl Default for Config {
    fn default() -> Self {
        Self::new()
    }
}

impl Config {
    pub fn new() -> Self {
        // Parse the command-line arguments
        let args = ConfigArgs::parse();

        let chain_id = env::var("CHAIN_ID")
            .unwrap_or_else(|_| args.chain_id.to_string())
            .parse::<usize>()
            .expect("Invalid chain_id value");

        let batch_size = env::var("BATCH_SIZE")
            .unwrap_or_else(|_| args.batch_size.to_string())
            .parse::<usize>()
            .expect("Invalid batch_size value");

        let start_block = env::var("START_BLOCK")
            .unwrap_or_else(|_| args.start_block.to_string())
            .parse::<u64>()
            .expect("Invalid start_block value");

        let end_block = env::var("START_BLOCK")
            .unwrap_or_else(|_| args.end_block.to_string())
            .parse::<u64>()
            .expect("Invalid end_block value");

        Self { chain_id, batch_size, start_block, end_block }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_default_values() {
        // Create a Config with default values
        let config = Config::default();

        // Verify the default values
        assert_eq!(config.chain_id, 1);
        assert_eq!(config.batch_size, 1);
        assert_eq!(config.start_block, 0);
        assert_eq!(config.end_block, 0);
    }
}
