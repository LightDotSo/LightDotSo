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

// use super::args::{BundlerAndUoPoolArgs, BundlerArgs, CreateWalletArgs, RpcArgs, UoPoolArgs};
// use crate::bundler::{launch_bundler, launch_bundling, launch_rpc, launch_uopool};
// use clap::Parser;
// use std::future::pending;

// /// Start the bundler with all components (bundling component, user operation mempool, RPC
// server) #[derive(Debug, Parser)]
// pub struct BundlerCommand {
//     /// All Bundler specific args
//     #[clap(flatten)]
//     bundler: BundlerArgs,

//     /// All UoPool specific args
//     #[clap(flatten)]
//     uopool: UoPoolArgs,

//     /// Common Bundler and UoPool args
//     #[clap(flatten)]
//     common: BundlerAndUoPoolArgs,

//     /// All RPC args
//     #[clap(flatten)]
//     rpc: RpcArgs,
// }

// impl BundlerCommand {
//     /// Execute the command
//     pub async fn execute(self) -> anyhow::Result<()> {
//         launch_bundler(self.bundler, self.uopool, self.common, self.rpc).await?;
//         pending().await
//     }
// }

// /// Start the bundling component
// #[derive(Debug, Parser)]
// pub struct BundlingCommand {
//     /// All Bundler specific args
//     #[clap(flatten)]
//     bundler: BundlerArgs,

//     /// Common Bundler and UoPool args
//     #[clap(flatten)]
//     common: BundlerAndUoPoolArgs,

//     /// UoPool gRPC listen address
//     #[clap(long, default_value = "http://127.0.0.1:3002")]
//     pub uopool_grpc_listen_address: String,
// }

// impl BundlingCommand {
//     /// Execute the command
//     pub async fn execute(self) -> anyhow::Result<()> {
//         launch_bundling(
//             self.bundler,
//             self.common.eth_client_address,
//             self.common.chain,
//             self.common.entry_points,
//             self.uopool_grpc_listen_address,
//         )
//         .await?;
//         pending().await
//     }
// }

// /// Start the user operation mempool
// #[derive(Debug, Parser)]
// pub struct UoPoolCommand {
//     /// All UoPool specific args
//     #[clap(flatten)]
//     uopool: UoPoolArgs,

//     /// Common Bundler and UoPool args
//     #[clap(flatten)]
//     common: BundlerAndUoPoolArgs,
// }

// impl UoPoolCommand {
//     /// Execute the command
//     pub async fn execute(self) -> anyhow::Result<()> {
//         launch_uopool(
//             self.uopool,
//             self.common.eth_client_address,
//             self.common.chain,
//             self.common.entry_points,
//         )
//         .await?;
//         pending().await
//     }
// }

// /// Start the RPC server
// #[derive(Debug, Parser)]
// pub struct RpcCommand {
//     /// All RPC args
//     #[clap(flatten)]
//     rpc: RpcArgs,

//     /// Ethereum execution client RPC endpoint
//     #[clap(long, default_value = "http://127.0.0.1:8545")]
//     pub eth_client_address: String,

//     /// UoPool gRPC listen address
//     #[clap(long, default_value = "http://127.0.0.1:3002")]
//     pub uopool_grpc_listen_address: String,

//     /// Bundler gRPC listen address
//     #[clap(long, default_value = "http://127.0.0.1:3003")]
//     pub bundler_grpc_listen_address: String,
// }

// impl RpcCommand {
//     /// Execute the command
//     pub async fn execute(self) -> anyhow::Result<()> {
//         launch_rpc(
//             self.rpc,
//             self.eth_client_address,
//             self.uopool_grpc_listen_address,
//             self.bundler_grpc_listen_address,
//         )
//         .await?;
//         pending().await
//     }
// }

// /// Create wallet for bundling component
// #[derive(Debug, Parser)]
// pub struct CreateWalletCommand {
//     /// All create wallet args
//     #[clap(flatten)]
//     create_wallet: CreateWalletArgs,
// }

// impl CreateWalletCommand {
//     /// Execute the command
//     pub fn execute(self) -> anyhow::Result<()> {
//         create_wallet(self.create_wallet)
//     }
// }
