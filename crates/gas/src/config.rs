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

use crate::{gas::GasServerImpl, gas_api::GasServer};
use clap::Parser;
use eyre::Result;
use lightdotso_tracing::tracing::info;
use silius_rpc::JsonRpcServer;
use std::net::SocketAddr;

#[derive(Debug, Clone, Parser)]
pub struct GasArgs {
    /// The topics to consume.
    #[clap(long, default_value = "[::]:3000")]
    pub rpc_address: SocketAddr,
}

impl GasArgs {
    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("GasArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        // Create the server
        let mut server = JsonRpcServer::new(self.rpc_address.to_string(), true, false);

        // Add the gas server
        server.add_method(GasServerImpl {}.into_rpc()).unwrap();

        // Start the server
        let _handle = server.start().await.unwrap();

        Ok(())
    }
}
