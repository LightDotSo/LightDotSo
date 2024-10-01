// Copyright 2023-2024 LightDotSo.
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

use crate::{gas::GasApi, gas_api::GasApiServer};
use clap::Parser;
use eyre::{eyre, Result};
use lightdotso_jsonrpsee::rpc::{JsonRpcServer, JsonRpcServerType};
use lightdotso_tracing::tracing::info;
use std::{
    future::pending,
    net::{IpAddr, Ipv6Addr},
};

#[derive(Clone, Debug, Parser)]
pub struct GasArgs {}

impl GasArgs {
    pub async fn run(self) -> Result<()> {
        // Add info
        info!("GasArgs run, starting...");

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

                // Add the gas server
                server.add_methods(GasApi {}.into_rpc(), JsonRpcServerType::Http)?;

                // Start the server
                let _handle = server.start().await.map_err(|e| eyre!("Error in handle: {:?}", e));
                info!("Started gas JSON-RPC server at [::]:3000");

                pending::<Result<()>>().await
            }
        });
        info!("GasArgs run, finished");

        Ok(())
    }
}
