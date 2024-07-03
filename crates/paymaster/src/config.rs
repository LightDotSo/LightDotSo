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

use clap::Parser;
use eyre::{eyre, Result};
use lightdotso_jsonrpsee::rpc::{JsonRpcServer, JsonRpcServerType};
use lightdotso_tracing::tracing::{error, info};
use std::{
    future::pending,
    net::{IpAddr, Ipv6Addr},
};

use crate::{paymaster::PaymasterApi, paymaster_api::PaymasterApiServer};

#[derive(Debug, Clone, Parser)]
pub struct PaymasterArgs {
    /// The alchemy API key
    #[clap(long, env = "ALCHEMY_API_KEY")]
    pub alchemy_api_key: String,
    /// The pilmico API key
    #[clap(long, env = "PIMLICO_API_KEY")]
    pub pimlico_api_key: String,
    /// The particle network project id
    #[clap(long, env = "PARTICLE_NETWORK_PROJECT_ID")]
    pub particle_network_project_id: String,
    /// The particle network paymaster project key
    #[clap(long, env = "PARTICLE_NETWORK_PROJECT_KEY")]
    pub particle_network_project_key: String,
}

impl PaymasterArgs {
    pub async fn run(self) -> Result<()> {
        // Add info
        info!("PaymasterArgs run, starting...");

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
                server.add_methods(PaymasterApi {}.into_rpc(), JsonRpcServerType::Http)?;

                // Start the server
                let handle = server.start().await.map_err(|e| eyre!("Error in handle: {:?}", e));

                if handle.is_err() {
                    error!("Error in handle: {:?}", handle);
                } else {
                    info!("Started paymaster JSON-RPC server at [::]:3000");
                }

                pending::<Result<()>>().await
            }
        });
        info!("PaymasterArgs run, finished");

        Ok(())
    }
}
