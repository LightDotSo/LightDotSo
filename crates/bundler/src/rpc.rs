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

use std::{
    collections::HashSet,
    future::pending,
    net::{IpAddr, Ipv6Addr},
};

use lightdotso_tracing::tracing::info;
use silius_grpc::{bundler_client::BundlerClient, uo_pool_client::UoPoolClient};
use silius_rpc::{
    debug_api::{DebugApiServer, DebugApiServerImpl},
    eth_api::{EthApiServer, EthApiServerImpl},
    web3_api::{Web3ApiServer, Web3ApiServerImpl},
    JsonRpcServer, JsonRpcServerType,
};

pub async fn launch_rpc(
    eth_client_address: String,
    uopool_grpc_listen_address: String,
    bundler_grpc_listen_address: String,
) -> anyhow::Result<()> {
    info!("Starting bundler JSON-RPC server...");

    let mut server = JsonRpcServer::new(
        true,
        IpAddr::V6(Ipv6Addr::LOCALHOST),
        3000,
        true,
        IpAddr::V6(Ipv6Addr::LOCALHOST),
        3001,
    )
    .with_cors(&["*".to_string()], JsonRpcServerType::Http)
    .with_cors(&["*".to_string()], JsonRpcServerType::Ws)
    .with_proxy(eth_client_address);

    let http_api: HashSet<String> =
        HashSet::from_iter(["eth".to_string(), "debug".to_string(), "web3".to_string()]);
    let ws_api: HashSet<String> =
        HashSet::from_iter(["eth".to_string(), "debug".to_string(), "web3".to_string()]);

    if http_api.contains("web3") {
        server.add_methods(Web3ApiServerImpl {}.into_rpc(), JsonRpcServerType::Http)?;
    }
    if ws_api.contains("web3") {
        server.add_methods(Web3ApiServerImpl {}.into_rpc(), JsonRpcServerType::Ws)?;
    }

    info!("Connecting to uopool gRPC service...");
    let uopool_grpc_client = UoPoolClient::connect(uopool_grpc_listen_address).await?;
    info!("Connected to uopool gRPC service...");

    if http_api.contains("eth") {
        server.add_methods(
            EthApiServerImpl { uopool_grpc_client: uopool_grpc_client.clone() }.into_rpc(),
            JsonRpcServerType::Http,
        )?;
    }
    if ws_api.contains("eth") {
        server.add_methods(
            EthApiServerImpl { uopool_grpc_client: uopool_grpc_client.clone() }.into_rpc(),
            JsonRpcServerType::Ws,
        )?;
    }

    info!("Connecting to bundling gRPC service...");
    let bundler_grpc_client = BundlerClient::connect(bundler_grpc_listen_address).await?;
    info!("Connected to bundling gRPC service...");

    if http_api.contains("debug") {
        server.add_methods(
            DebugApiServerImpl {
                uopool_grpc_client: uopool_grpc_client.clone(),
                bundler_grpc_client: bundler_grpc_client.clone(),
            }
            .into_rpc(),
            JsonRpcServerType::Http,
        )?;
    }

    if ws_api.contains("debug") {
        server.add_methods(
            DebugApiServerImpl { uopool_grpc_client, bundler_grpc_client }.into_rpc(),
            JsonRpcServerType::Ws,
        )?;
    }

    tokio::spawn(async move {
        let (_http_handle, _ws_handle) = server.start().await?;

        info!(
            "Started bundler JSON-RPC server with http: {:?}:{:?}, ws: {:?}:{:?}",
            IpAddr::V6(Ipv6Addr::LOCALHOST),
            3000,
            IpAddr::V6(Ipv6Addr::LOCALHOST),
            3001,
        );
        pending::<anyhow::Result<()>>().await
    });

    Ok(())
}
