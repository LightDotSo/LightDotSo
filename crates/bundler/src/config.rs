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
    eth::EthApiServerImpl,
    eth_api::EthApiServer,
    utils::{parse_address, parse_u256},
};
use clap::Parser;
use ethers::types::{Address, U256};
use eyre::{eyre, Result};
use lightdotso_tracing::tracing::info;
use silius_rpc::{JsonRpcServer, JsonRpcServerType};
use std::{
    future::pending,
    net::{IpAddr, Ipv6Addr},
};

#[derive(Debug, Clone, Parser)]
pub struct BundlerArgs {
    #[clap(long, env = "BUNDLER_BENEFICIARY_ADDRESS", default_value = "", value_parser=parse_address)]
    pub beneficiary: Address,
    /// The address of the bundler
    #[clap(long, env = "BUNDLER_ADDRESS", default_value = "", value_parser=parse_address)]
    pub bundler: Address,
    /// The private key of the bundler
    #[clap(long, env = "BUNDLER_PRIVATE_KEY", hide = true)]
    pub private_key: String,
    /// The max verification gas
    #[clap(long, default_value="3000000", value_parser=parse_u256)]
    pub max_verification_gas: U256,
    /// The max verification gas
    #[clap(long, default_value="3000000", value_parser=parse_u256)]
    pub min_balance: U256,
}

impl BundlerArgs {
    pub async fn run(self) -> Result<()> {
        // Add info
        info!("BundlerArgs run, entering");

        // Print the config
        info!("Config: {:?}", self);

        tokio::spawn({
            async move {
                // Create the server
                let mut server = JsonRpcServer::new(
                    true,
                    IpAddr::V6(Ipv6Addr::UNSPECIFIED),
                    3000,
                    true,
                    IpAddr::V6(Ipv6Addr::UNSPECIFIED),
                    3001,
                );

                // Add the paymaster server
                server
                    .add_methods(
                        EthApiServerImpl { args: self.clone() }.into_rpc(),
                        JsonRpcServerType::Http,
                    )
                    .unwrap();

                // Start the server
                let _handle = server.start().await.map_err(|e| eyre!("Error in handle: {:?}", e));
                info!("Started bundler JSON-RPC server at [::]:3000");

                pending::<Result<()>>().await
            }
        });
        info!("BundlerArgs run, finished");

        Ok(())
    }
}
