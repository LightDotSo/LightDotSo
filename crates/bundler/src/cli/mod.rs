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

// use crate::utils::run_until_ctrl_c;
// use clap::{value_parser, Parser, Subcommand};
// use std::panic;

pub mod args;
pub mod commands;

// /// The main Silius CLI interface
// #[derive(Debug, Parser)]
// #[command(author, version, about = "Silius", long_about = None)]
// pub struct Cli {
//     /// The command to execute
//     #[clap(subcommand)]
//     command: Commands,

//     /// The verbosity level
//     #[clap(long, short, global = true, default_value_t = 2, value_parser =
// value_parser!(u8).range(..=4))]     verbosity: u8,
// }

// impl Cli {
//     /// Get the log level based on the verbosity level
//     pub fn get_log_level(&self) -> String {
//         match self.verbosity {
//             0 => "error",
//             1 => "warn",
//             2 => "info",
//             3 => "debug",
//             _ => "trace",
//         }
//         .to_string()
//     }
// }

// /// Commands to be executed
// #[derive(Debug, Subcommand)]
// pub enum Commands {
//     /// Start the bundler with all components (bundling component, user operation mempool, RPC
// server)     #[command(name = "bundler")]
//     Bundler(Box<commands::BundlerCommand>),

//     /// Start the bundling component
//     #[command(name = "bundling")]
//     Bundling(commands::BundlingCommand),

//     /// Start the user operation mempool
//     #[command(name = "uopool")]
//     UoPool(commands::UoPoolCommand),

//     /// Start the RPC server
//     #[command(name = "rpc")]
//     Rpc(commands::RpcCommand),

//     /// Create wallet for bundling component
//     #[command(name = "create-wallet")]
//     CreateWallet(commands::CreateWalletCommand),
// }

// pub fn run() -> anyhow::Result<()> {
//     let cli = Cli::parse();

//     std::env::set_var("RUST_LOG", format!("silius={}", cli.get_log_level()));
//     tracing_subscriber::fmt::init();

//     std::thread::Builder::new()
//         .stack_size(128 * 1024 * 1024)
//         .spawn(move || {
//             let rt = tokio::runtime::Builder::new_multi_thread()
//                 .enable_all()
//                 .thread_stack_size(128 * 1024 * 1024)
//                 .build()?;

//             let task = async move {
//                 match cli.command {
//                     Commands::Bundler(command) => command.execute().await,
//                     Commands::Bundling(command) => command.execute().await,
//                     Commands::UoPool(command) => command.execute().await,
//                     Commands::Rpc(command) => command.execute().await,
//                     Commands::CreateWallet(command) => command.execute(),
//                 }
//             };

//             rt.block_on(run_until_ctrl_c(task))?;
//             Ok(())
//         })?
//         .join()
//         .unwrap_or_else(|e| panic::resume_unwind(e))
// }
