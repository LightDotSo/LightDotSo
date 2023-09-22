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
    args::{BundlerAndUoPoolArgs, BundlerArgs as BundlerArgsOriginal, RpcArgs, UoPoolArgs},
    bundler::Bundler,
};
use clap::Parser;
use eyre::Result;
use lightdotso_tracing::tracing::{error, info};

#[derive(Debug, Clone, Parser)]
pub struct BundlerArgs {
    /// The original bundler args
    #[clap(flatten)]
    pub bundler_args: BundlerArgsOriginal,
    /// All UoPool specific args
    #[clap(flatten)]
    pub uopool_args: UoPoolArgs,
    /// Common Bundler and UoPool args
    #[clap(flatten)]
    pub common_args: BundlerAndUoPoolArgs,
    /// All RPC args
    #[clap(flatten)]
    pub rpc_args: RpcArgs,
}

impl BundlerArgs {
    pub async fn create(&self) -> Bundler {
        // Create the bundler
        Bundler::new(
            self.bundler_args.clone(),
            self.uopool_args.clone(),
            self.common_args.clone(),
            self.rpc_args.clone(),
        )
        .await
    }

    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("BundlerArgs run, entering");

        // Print the config
        info!("Config: {:?}", self);

        // Construct the bundler
        let bundler = Bundler::new(
            self.bundler_args.clone(),
            self.uopool_args.clone(),
            self.common_args.clone(),
            self.rpc_args.clone(),
        )
        .await;

        // Run the bundler
        let res = bundler.run().await;

        // Log if error
        if res.is_err() {
            error!("index error: {:?}", res);
        }

        Ok(())
    }
}
