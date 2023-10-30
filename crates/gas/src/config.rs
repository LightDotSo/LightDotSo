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

use crate::{gas::GasApi, gas_api::GasApiServer};
use clap::Parser;
use eyre::{eyre, Result};
use lightdotso_jsonrpsee::rpc::{JsonRpcServer, JsonRpcServerType};
use lightdotso_tracing::tracing::info;
use std::{
    future::pending,
    net::{IpAddr, Ipv6Addr},
};

#[derive(Debug, Clone, Parser)]
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
                server.add_methods(GasApi {}.into_rpc(), JsonRpcServerType::Http).unwrap();

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
