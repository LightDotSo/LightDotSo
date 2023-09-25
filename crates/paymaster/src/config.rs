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

use crate::{paymaster::PaymasterServerImpl, paymaster_api::PaymasterServer};
use clap::Parser;
use eyre::{eyre, Result};
use lightdotso_tracing::tracing::info;
use silius_rpc::{JsonRpcServer, JsonRpcServerType};
use std::{
    future::pending,
    net::{IpAddr, Ipv6Addr},
};

#[derive(Debug, Clone, Parser)]
pub struct PaymasterArgs {
    /// The infura API key
    #[clap(long, env = "PAYMASTER_PRIVATE_KEY")]
    pub paymaster_private_key: String,
    /// The topics to consume.
    #[clap(long, default_value = "[::]:3000")]
    pub rpc_address: String,
}

impl PaymasterArgs {
    pub async fn run(self) -> Result<()> {
        // Add info
        info!("PaymasterArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        tokio::spawn({
            async move {
                // Create the server
                let mut server = JsonRpcServer::new(
                    true,
                    IpAddr::V6(Ipv6Addr::LOCALHOST),
                    3000,
                    true,
                    IpAddr::V6(Ipv6Addr::LOCALHOST),
                    3001,
                );

                // Add the paymaster server
                server
                    .add_methods(PaymasterServerImpl {}.into_rpc(), JsonRpcServerType::Http)
                    .unwrap();

                // Start the server
                let _handle = server.start().await.map_err(|e| eyre!("Error in handle: {:?}", e));
                info!("Started bundler JSON-RPC server at {:}", self.rpc_address,);

                pending::<Result<()>>().await
            }
        });
        info!("PaymasterArgs run, finished");

        Ok(())
    }
}
