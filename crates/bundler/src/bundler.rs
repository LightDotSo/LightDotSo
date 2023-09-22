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
    config::BundlerArgs,
    constants::ENTRYPOINT_ADDRESSES,
    opts::{BundlerOpts, UoPoolOpts},
    rpc::launch_rpc,
    utils::unwrap_path_or_home,
};
use ethers::{
    providers::{Http, Middleware, Provider},
    types::{Address, U256},
};
use eyre::{eyre, format_err, Result};
use lightdotso_tracing::tracing::{error, info};
use silius_grpc::{
    bundler_client::BundlerClient, bundler_service_run, uo_pool_client::UoPoolClient,
    uopool_service_run,
};
use silius_primitives::{bundler::SendBundleMode, Chain, Wallet};
use silius_rpc::{
    debug_api::{DebugApiServer, DebugApiServerImpl},
    eth_api::{EthApiServer, EthApiServerImpl},
    web3_api::{Web3ApiServer, Web3ApiServerImpl},
    JsonRpcServer,
};
use std::{future::pending, sync::Arc};

#[derive(Clone)]
pub struct Bundler {
    uopool_opts: UoPoolOpts,
    max_verification_gas: U256,
    chain_id: usize,
    bundler_opts: BundlerOpts,
    rpc: String,
    beneficiary: Address,
    seed_phrase: String,
}

impl Bundler {
    /// Constructs the new Bundler
    pub async fn new(args: &BundlerArgs) -> Self {
        info!("Bundler new, starting");

        Bundler {
            uopool_opts: args.uopool_opts.clone(),
            max_verification_gas: args.max_verification_gas,
            chain_id: args.chain_id,
            bundler_opts: args.bundler_opts.clone(),
            rpc: args.rpc.clone(),
            beneficiary: args.beneficiary,
            seed_phrase: args.seed_phrase.clone(),
        }
    }
    /// Runs the bundler
    pub async fn run(self) -> anyhow::Result<()> {
        info!("Starting ERC-4337 AA Bundler");

        let eth_client = Arc::new(Provider::<Http>::try_from(self.rpc.clone())?);
        info!(
            "Connected to the Ethereum execution client at {}: {}",
            self.rpc,
            eth_client.client_version().await?
        );

        let chain_id = eth_client.get_chainid().await?;
        let chain = Chain::from(chain_id);

        // if self.chain_id != chain_id.as_u64() as usize {
        //     return Err(format_err!(
        //         "Bundler tries to connect to the execution client of different chain: {} != {}",
        //         self.chain_id,
        //         chain_id
        //     ));
        // }

        info!("Loading wallet from mnemonic file...");
        let wallet = Wallet::from_phrase(&self.seed_phrase, &chain_id, false)
            .map_err(|error| format_err!("Could not load mnemonic file: {}", error))?;
        info!("{:?}", wallet.signer);

        let datadir = unwrap_path_or_home(None)?;

        info!("Starting uopool gRPC service...");
        let res = uopool_service_run(
            self.uopool_opts.uopool_addr,
            datadir,
            ENTRYPOINT_ADDRESSES.to_vec(),
            eth_client,
            chain,
            self.max_verification_gas,
            self.uopool_opts.min_stake,
            self.uopool_opts.min_unstake_delay,
            self.uopool_opts.min_priority_fee_per_gas,
            self.uopool_opts.whitelist,
            silius_primitives::UoPoolMode::Standard,
        )
        .await
        .map_err(|e| eyre!("Error in uopool gRPC service: {:?}", e));
        if res.is_err() {
            error!("Error in uopool gRPC service: {:?}", res);
        }
        info!("Started uopool gRPC service at {:}", self.uopool_opts.uopool_grpc_listen_address);

        info!("Connecting to uopool gRPC service");
        let uopool_grpc_client = UoPoolClient::connect(format!(
            "http://{}",
            self.uopool_opts.uopool_grpc_listen_address
        ))
        .await?;
        info!("Connected to uopool gRPC service");

        bundler_service_run(
            self.bundler_opts.bundler_addr,
            wallet,
            ENTRYPOINT_ADDRESSES.to_vec(),
            self.rpc.clone(),
            chain,
            self.beneficiary,
            self.bundler_opts.min_balance,
            self.bundler_opts.bundle_interval,
            uopool_grpc_client.clone(),
            SendBundleMode::EthClient,
            None,
        );

        launch_rpc(
            self.rpc.clone(),
            format!("http://{:?}:{:?}", self.uopool_opts.uopool_addr, self.uopool_opts.uopool_port),
            format!(
                "http://{:?}:{:?}",
                self.bundler_opts.bundler_addr, self.bundler_opts.bundler_port
            ),
        )
        .await?;

        pending().await
    }
}
