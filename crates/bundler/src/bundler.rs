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
    opts::{BundlerServiceOpts, RpcServiceOpts, UoPoolServiceOpts},
    utils::run_until_ctrl_c,
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
use silius_primitives::{Chain, Wallet};
use silius_rpc::{
    debug_api::{DebugApiServer, DebugApiServerImpl},
    eth_api::{EthApiServer, EthApiServerImpl},
    web3_api::{Web3ApiServer, Web3ApiServerImpl},
    JsonRpcServer,
};
use std::{future::pending, panic, sync::Arc};

#[derive(Clone)]
pub struct Bundler {
    entry_points: Vec<Address>,
    uopool_opts: UoPoolServiceOpts,
    max_verification_gas: U256,
    chain_id: usize,
    rpc_opts: RpcServiceOpts,
    bundler_opts: BundlerServiceOpts,
    rpc: String,
    beneficiary: Address,
    seed_phrase: String,
}

impl Bundler {
    /// Constructs the new Bundler
    pub async fn new(args: &BundlerArgs) -> Self {
        info!("Bundler new, starting");

        Bundler {
            entry_points: args.entry_points.clone(),
            uopool_opts: args.uopool_opts.clone(),
            max_verification_gas: args.max_verification_gas,
            chain_id: args.chain_id,
            rpc_opts: args.rpc_opts.clone(),
            bundler_opts: args.bundler_opts.clone(),
            rpc: args.rpc.clone(),
            beneficiary: args.beneficiary,
            seed_phrase: args.seed_phrase.clone(),
        }
    }
    /// Runs the bundler
    pub async fn run(self) -> Result<()> {
        std::thread::Builder::new()
        .stack_size(128 * 1024 * 1024)
        .spawn(move || {
            let rt = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .thread_stack_size(128 * 1024 * 1024)
                .build()?;

            let task = async move {
                info!("Starting ERC-4337 AA Bundler");

                let eth_client =
                    Arc::new(Provider::<Http>::try_from(self.rpc.clone())?);
                info!(
                    "Connected to the Ethereum execution client at {}: {}",
                    self.rpc,
                    eth_client.client_version().await?
                );

                let chain_id = eth_client.get_chainid().await?;
                let chain = Chain::from(chain_id);

                if self.chain_id != chain_id.as_u64() as usize {
                        return Err(format_err!(
                            "Bundler tries to connect to the execution client of different chain: {} != {}",
                            self.chain_id,
                            chain_id
                        ));
                }

                info!("Loading wallet from mnemonic file...");
                let wallet = Wallet::from_phrase(&self.seed_phrase, &chain_id)
                    .map_err(|error| format_err!("Could not load mnemonic file: {}", error))?;
                info!("{:?}", wallet.signer);

                info!("Starting uopool gRPC service...");
                let res = uopool_service_run(
                    self.uopool_opts.uopool_grpc_listen_address,
                    self.entry_points.clone(),
                    eth_client,
                    chain,
                    self.max_verification_gas,
                    self.uopool_opts.min_stake,
                    self.uopool_opts.min_unstake_delay,
                    self.uopool_opts.min_priority_fee_per_gas,
                    self.uopool_opts.whitelist,
                    self.uopool_opts.uo_pool_mode,
                )
                .await.map_err(|e| eyre!("Error in uopool gRPC service: {:?}", e));
                if res.is_err() {
                    error!("Error in uopool gRPC service: {:?}", res);
                }

                info!(
                    "Started uopool gRPC service at {:}",
                    self.uopool_opts.uopool_grpc_listen_address
                    );

                info!("Connecting to uopool gRPC service");
                let uopool_grpc_client = UoPoolClient::connect(format!(
                    "http://{}",
                    self.uopool_opts.uopool_grpc_listen_address
                ))
                .await?;
                info!("Connected to uopool gRPC service");

                info!("Starting bundler gRPC service...");
                bundler_service_run(
                    self.bundler_opts.bundler_grpc_listen_address,
                    wallet,
                    ENTRYPOINT_ADDRESSES.to_vec(),
                    self.rpc.clone(),
                    chain,
                    self.beneficiary,
                    self.bundler_opts.min_balance,
                    self.bundler_opts.bundle_interval,
                    uopool_grpc_client.clone(),
                );
                info!(
                    "Started bundler gRPC service at {:}",
                    self.bundler_opts.bundler_grpc_listen_address
                );


                info!("Starting bundler JSON-RPC server...");
                tokio::spawn({
                    async move {
                        let mut server = JsonRpcServer::new(self.rpc_opts.rpc_listen_address.clone(), true, false)
                        .with_proxy(self.rpc)
                        .with_cors(self.rpc_opts.cors_domain);

                        server.add_method(Web3ApiServerImpl{}.into_rpc()).map_err(|e| eyre!("Error in web3: {:?}", e))?;

                        let eth_res = server.add_method(
                            EthApiServerImpl {
                                uopool_grpc_client: uopool_grpc_client.clone(),
                            }
                            .into_rpc(),
                        ).map_err(|e| eyre!("Error in eth: {:?}", e));
                        if eth_res.is_err() {
                            error!("Error in eth: {:?}", eth_res);
                        }

                        let bundler_grpc_client = BundlerClient::connect(format!(
                            "http://{}",
                            self.bundler_opts.bundler_grpc_listen_address
                        ))
                        .await?;
                        let debug_res = server.add_method(
                            DebugApiServerImpl {
                                uopool_grpc_client,
                                bundler_grpc_client,
                            }
                            .into_rpc(),
                        ).map_err(|e| eyre!("Error in debug: {:?}", e));
                        if debug_res.is_err() {
                            error!("Error in debug: {:?}", debug_res);
                        }

                        let _handle = server.start().await.map_err(|e| eyre!("Error in handle: {:?}", e));
                        info!(
                            "Started bundler JSON-RPC server at {:}",
                            self.rpc_opts.rpc_listen_address,
                        );

                    pending::<Result<()>>().await
                    }
                });

                pending().await
            };
            rt.block_on(run_until_ctrl_c(task))?;
            Ok(())

        })?
        .join()
        .unwrap_or_else(|e| panic::resume_unwind(e))
    }
}
