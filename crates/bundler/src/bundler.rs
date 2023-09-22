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

// Entire file and code is from: https://github.com/Vid201/silius/blob/ea49b426d19f848e422d1fc3a7557ddb9f485cf7/bin/silius/src/silius.rs
// License: MIT or Apache-2.0
// Slightly modified with minor changes to make it work with our codebase
// Thank you Vid201 for your work - it could not have been done without you

use crate::{
    cli::args::{BundlerAndUoPoolArgs, BundlerArgs, RpcArgs, UoPoolArgs},
    constants::ENTRYPOINT_ADDRESSES,
    utils::unwrap_path_or_home,
};
use ethers::{
    providers::{Http, Middleware, Provider},
    types::Address,
};
use lightdotso_tracing::tracing::info;
use silius_grpc::{
    bundler_client::BundlerClient, bundler_service_run, uo_pool_client::UoPoolClient,
    uopool_service_run,
};
use silius_primitives::{
    bundler::SendBundleMode, consts::flashbots_relay_endpoints, Chain, Wallet,
};
use silius_rpc::{
    debug_api::{DebugApiServer, DebugApiServerImpl},
    eth_api::{EthApiServer, EthApiServerImpl},
    web3_api::{Web3ApiServer, Web3ApiServerImpl},
    JsonRpcServer, JsonRpcServerType,
};
use std::{collections::HashSet, future::pending, net::SocketAddr, sync::Arc};

#[derive(Clone)]
pub struct Bundler {
    bundler_args: BundlerArgs,
    uopool_args: UoPoolArgs,
    common_args: BundlerAndUoPoolArgs,
    rpc_args: RpcArgs,
}

impl Bundler {
    /// Constructs the new Bundler
    pub async fn new(
        bundler_args: BundlerArgs,
        uopool_args: UoPoolArgs,
        common_args: BundlerAndUoPoolArgs,
        rpc_args: RpcArgs,
    ) -> Self {
        info!("Bundler new, starting");

        Bundler { bundler_args, uopool_args, common_args, rpc_args }
    }
    /// Runs the bundler
    pub async fn run(self) -> anyhow::Result<()> {
        info!("Starting ERC-4337 AA Bundler");
        launch_bundler(self.bundler_args, self.uopool_args, self.common_args, self.rpc_args)
            .await?;
        pending().await
    }
}

pub async fn launch_bundler(
    bundler_args: BundlerArgs,
    uopool_args: UoPoolArgs,
    common_args: BundlerAndUoPoolArgs,
    rpc_args: RpcArgs,
) -> anyhow::Result<()> {
    launch_uopool(
        uopool_args.clone(),
        common_args.eth_client_address.clone(),
        common_args.chain_id,
        common_args.entry_points.clone(),
    )
    .await?;

    launch_bundling(
        bundler_args.clone(),
        common_args.eth_client_address.clone(),
        common_args.chain_id,
        ENTRYPOINT_ADDRESSES.to_vec(),
        // common_args.entry_points,
        format!("http://{:?}:{:?}", uopool_args.uopool_addr, uopool_args.uopool_port),
    )
    .await?;

    launch_rpc(
        rpc_args,
        common_args.eth_client_address,
        format!("http://{:?}:{:?}", uopool_args.uopool_addr, uopool_args.uopool_port),
        format!("http://{:?}:{:?}", bundler_args.bundler_addr, bundler_args.bundler_port),
    )
    .await?;

    Ok(())
}

pub async fn launch_bundling(
    args: BundlerArgs,
    eth_client_address: String,
    chain_id: u64,
    entry_points: Vec<Address>,
    uopool_grpc_listen_address: String,
) -> anyhow::Result<()> {
    info!("Starting bundling gRPC service...");

    let eth_client = Arc::new(Provider::<Http>::try_from(eth_client_address.clone())?);
    let eth_client_version = check_connected_chain(eth_client.clone(), chain_id).await?;
    info!(
        "Bundling component connected to Ethereum execution client at {}: {}",
        eth_client_address, eth_client_version
    );

    let chain_id = eth_client.get_chainid().await?;
    let chain_conn = Chain::from(chain_id);

    info!("Loading wallet from mnemonic ...");
    let wallet = Wallet::from_phrase(&args.seed_phrase, &chain_id, false)
        .map_err(|error| anyhow::format_err!("Could not load mnemonic file: {}", error))?;
    info!("{:?}", wallet.signer);

    // let wallet: Wallet;
    // if args.send_bundle_mode == SendBundleMode::Flashbots {
    //     wallet = Wallet::from_file(args.mnemonic_file.into(), &chain_id, true)
    //         .map_err(|error| anyhow::format_err!("Could not load mnemonic file: {}", error))?;
    //     info!("Wallet Signer {:?}", wallet.signer);
    //     info!("Flashbots Signer {:?}", wallet.fb_signer);
    // } else {
    //     wallet = Wallet::from_file(args.mnemonic_file.into(), &chain_id, false)
    //         .map_err(|error| anyhow::format_err!("Could not load mnemonic file: {}", error))?;
    //     info!("{:?}", wallet.signer);
    // }

    info!("Connecting to uopool gRPC service...");
    let uopool_grpc_client = UoPoolClient::connect(uopool_grpc_listen_address).await?;
    info!("Connected to uopool gRPC service");

    bundler_service_run(
        SocketAddr::new(args.bundler_addr, args.bundler_port),
        wallet,
        entry_points,
        eth_client_address,
        chain_conn,
        args.beneficiary,
        args.min_balance,
        args.bundle_interval,
        uopool_grpc_client,
        args.send_bundle_mode,
        match args.send_bundle_mode {
            SendBundleMode::EthClient => None,
            SendBundleMode::Flashbots => {
                Some(vec![flashbots_relay_endpoints::FLASHBOTS.to_string()])
            }
        },
    );
    info!("Started bundler gRPC service at {:?}:{:?}", args.bundler_addr, args.bundler_port);

    Ok(())
}

pub async fn launch_uopool(
    args: UoPoolArgs,
    eth_client_address: String,
    chain_id: u64,
    entry_points: Vec<Address>,
) -> anyhow::Result<()> {
    info!("Starting uopool gRPC service...");

    let eth_client = Arc::new(Provider::<Http>::try_from(eth_client_address.clone())?);
    let eth_client_version = check_connected_chain(eth_client.clone(), chain_id).await?;
    info!(
        "UoPool connected to Ethereum execution client at {}: {}",
        eth_client_address, eth_client_version
    );

    let chain_id = Chain::from(eth_client.get_chainid().await?);

    let datadir = unwrap_path_or_home(args.datadir)?;

    uopool_service_run(
        SocketAddr::new(args.uopool_addr, args.uopool_port),
        datadir,
        entry_points,
        eth_client.clone(),
        chain_id,
        args.max_verification_gas,
        args.min_stake,
        args.min_unstake_delay,
        args.min_priority_fee_per_gas,
        args.whitelist,
        args.uopool_mode,
    )
    .await?;

    info!("Started uopool gRPC service at {:?}:{:?}", args.uopool_addr, args.uopool_port);

    Ok(())
}

pub async fn launch_rpc(
    args: RpcArgs,
    eth_client_address: String,
    uopool_grpc_listen_address: String,
    bundler_grpc_listen_address: String,
) -> anyhow::Result<()> {
    if !args.is_enabled() {
        return Err(anyhow::anyhow!("No RPC protocol is enabled"));
    }

    info!("Starting bundler JSON-RPC server...");

    let mut server = JsonRpcServer::new(
        args.http,
        args.http_addr,
        args.http_port,
        args.ws,
        args.ws_addr,
        args.ws_port,
    )
    .with_cors(&args.http_corsdomain, JsonRpcServerType::Http)
    .with_cors(&args.ws_origins, JsonRpcServerType::Ws)
    .with_proxy(eth_client_address);

    let http_api: HashSet<String> = HashSet::from_iter(args.http_api.iter().cloned());
    let ws_api: HashSet<String> = HashSet::from_iter(args.ws_api.iter().cloned());

    if http_api.contains("web3") {
        server.add_methods(Web3ApiServerImpl {}.into_rpc(), JsonRpcServerType::Http)?;
    }
    if ws_api.contains("web3") {
        server.add_methods(Web3ApiServerImpl {}.into_rpc(), JsonRpcServerType::Ws)?;
    }

    info!("Connecting to uopool gRPC service...");
    let uopool_grpc_client = UoPoolClient::connect(uopool_grpc_listen_address).await?;
    info!("Connected to uopool gRPC service...");

    if args.is_api_method_enabled("eth") {
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
    }

    if args.is_api_method_enabled("debug") {
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
    }

    tokio::spawn(async move {
        let (_http_handle, _ws_handle) = server.start().await?;

        info!(
            "Started bundler JSON-RPC server with http: {:?}:{:?}, ws: {:?}:{:?}",
            args.http_addr, args.http_port, args.ws_addr, args.ws_port,
        );
        pending::<anyhow::Result<()>>().await
    });

    Ok(())
}

// pub fn create_wallet(args: CreateWalletArgs) -> anyhow::Result<()> {
//     info!("Creating bundler wallet... Storing to: {:?}", args.output_path);

//     let path = unwrap_path_or_home(args.output_path)?;

//     if args.flashbots_key {
//         let wallet = Wallet::build_random(path, &args.chain_id, true)?;
//         info!("Wallet signer {:?}", wallet.signer);
//         info!("Flashbots signer {:?}", wallet.fb_signer);
//     } else {
//         let wallet = Wallet::build_random(path, &args.chain_id, false)?;
//         info!("Wallet signer {:?}", wallet.signer);
//     }

//     Ok(())
// }

async fn check_connected_chain(
    eth_client: Arc<Provider<Http>>,
    chain_id: u64,
) -> anyhow::Result<String> {
    let client_chain_id = eth_client.get_chainid().await?;

    if client_chain_id != chain_id.into() {
        return Err(anyhow::format_err!(
            "Tried to connect to the execution client of different chain: {} != {}",
            client_chain_id,
            chain_id
        ));
    }

    Ok(eth_client.client_version().await?)
}
