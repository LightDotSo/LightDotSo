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

// use crate::{paymaster::PaymasterServerImpl, paymaster_api::PaymasterServer};
use clap::Parser;
use eyre::{eyre, Result};
use lightdotso_tracing::tracing::info;
use silius_rpc::JsonRpcServer;
use std::future::pending;

#[derive(Debug, Clone, Parser)]
pub struct PaymasterArgs {
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
                let server = JsonRpcServer::new(self.rpc_address.clone(), true, false);

                // Add the paymaster server
                // server.add_method(PaymasterServerImpl {}.into_rpc()).unwrap();

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
