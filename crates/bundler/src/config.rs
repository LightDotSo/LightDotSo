// Copyright 2023-2024 Light, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use crate::{eth::EthApi, eth_api::EthApiServer};
use clap::Parser;
use ethers::types::{Address, U256};
use eyre::{eyre, Result};
use lightdotso_jsonrpsee::rpc::{JsonRpcServer, JsonRpcServerType};
use lightdotso_tracing::tracing::info;
use lightdotso_utils::{parse_address, parse_u256};
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
        // info!("Config: {:?}", self);

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
                server.add_methods(EthApi {}.into_rpc(), JsonRpcServerType::Http)?;

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
