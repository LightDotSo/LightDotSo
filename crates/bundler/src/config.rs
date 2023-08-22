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
    bundler::Bundler,
    opts::{BundlerServiceOpts, RpcServiceOpts, UoPoolServiceOpts},
    utils::{parse_address, parse_u256},
};
use clap::Parser;
use ethers::types::{Address, U256};
use eyre::Result;
use lightdotso_tracing::tracing::info;

#[derive(Debug, Clone, Parser)]
pub struct BundlerArgs {
    #[clap(long, env = "BUNDLER_BENEFICIARY_ADDRESS", default_value = "", value_parser=parse_address)]
    pub beneficiary: Address,
    /// The seed phrase of mnemonic
    #[clap(long, env = "BUNDLER_SEED_PHRASE")]
    pub seed_phrase: String,
    /// The entry points
    #[clap(long, value_delimiter=',', value_parser=parse_address)]
    pub entry_points: Vec<Address>,
    /// The uopool options
    #[clap(flatten)]
    pub uopool_opts: UoPoolServiceOpts,
    /// The max verification gas
    #[clap(long, default_value="3000000", value_parser=parse_u256)]
    pub max_verification_gas: U256,
    /// The rpc options
    #[clap(flatten)]
    pub rpc_opts: RpcServiceOpts,
    /// The bundler options
    #[clap(flatten)]
    pub bundler_opts: BundlerServiceOpts,
    /// The chain id of the chain to index.
    #[arg(long, short, default_value_t = 1)]
    #[clap(long, env = "CHAIN_ID")]
    pub chain_id: usize,
    /// The RPC endpoint to connect to.
    #[arg(long, short, default_value_t = String::from(""))]
    #[clap(long, env = "BUNDLER_RPC_URL")]
    pub rpc: String,
    /// The websocket RPC endpoint to connect to.
    #[arg(long, default_value_t = String::from(""))]
    #[clap(long, env = "DISCORD_WEBHOOK")]
    pub webhook: String,
}

impl BundlerArgs {
    pub async fn create(&self) -> Bundler {
        // Create the bundler
        Bundler::new(self).await
    }

    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("BundlerArgs run, entering");

        // Print the config
        info!("Config: {:?}", self);

        // Construct the bundler
        let bundler = Bundler::new(self).await;

        // Run the bundler
        let _ = bundler.run().await;

        Ok(())
    }
}
