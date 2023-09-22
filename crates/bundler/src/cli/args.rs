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

use crate::utils::{parse_address, parse_send_bundle_mode, parse_u256, parse_uopool_mode};
use clap::Parser;
use ethers::types::{Address, U256};
use expanded_pathbuf::ExpandedPathBuf;
use silius_primitives::{
    bundler::SendBundleMode,
    consts::networking::{
        DEFAULT_BUNDLER_GRPC_PORT, DEFAULT_HTTP_RPC_PORT, DEFAULT_UOPOOL_GRPC_PORT,
        DEFAULT_WS_RPC_PORT,
    },
    UoPoolMode,
};
use std::net::{IpAddr, Ipv4Addr};

/// Bundler CLI args
#[derive(Debug, Clone, Parser, PartialEq)]
pub struct BundlerArgs {
    /// Bundler gRPC address to listen on.
    #[clap(long = "bundler.addr", default_value_t = IpAddr::V4(Ipv4Addr::LOCALHOST))]
    pub bundler_addr: IpAddr,

    /// Bundler gRPC port to listen on.
    #[clap(long = "bundler.port", default_value_t = DEFAULT_BUNDLER_GRPC_PORT)]
    pub bundler_port: u16,

    /// Path to the mnemonic file.
    // #[clap(long)]
    // pub mnemonic_file: PathBuf,

    /// The seed phrase of mnemonic
    #[clap(long, env = "BUNDLER_SEED_PHRASE")]
    pub seed_phrase: String,

    /// The bundler beneficiary address.
    // #[clap(long, value_parser=parse_address)]
    #[clap(long, env = "BUNDLER_BENEFICIARY_ADDRESS", default_value = "", value_parser=parse_address)]
    pub beneficiary: Address,

    /// The minimum balance required for the beneficiary address.
    ///
    /// By default, this option is set to `100000000000000000`.
    #[clap(long, default_value = "100000000000000000", value_parser=parse_u256)]
    pub min_balance: U256,

    /// The bundle interval in seconds.
    ///
    /// By default the interval time is set to 10
    #[clap(long, default_value_t = 10)]
    pub bundle_interval: u64,

    /// Sets the send bundle mode.
    ///
    /// By default, this option is set to `eth-client`.
    #[clap(long, default_value = "eth-client", value_parser=parse_send_bundle_mode)]
    pub send_bundle_mode: SendBundleMode,
}

/// UoPool CLI args
#[derive(Debug, Clone, Parser)]
pub struct UoPoolArgs {
    /// UoPool gRPC address to listen on.
    #[clap(long = "uopool.addr", default_value_t = IpAddr::V4(Ipv4Addr::LOCALHOST))]
    pub uopool_addr: IpAddr,

    /// UoPool gRPC port to listen on.
    #[clap(long = "uopool.port", default_value_t = DEFAULT_UOPOOL_GRPC_PORT)]
    pub uopool_port: u16,

    /// Data directory (primarily for database).
    #[clap(long)]
    pub datadir: Option<ExpandedPathBuf>,

    /// Max allowed verification gas.
    #[clap(long, default_value="3000000", value_parser=parse_u256)]
    pub max_verification_gas: U256,

    /// Minimum stake required for entities.
    #[clap(long, value_parser=parse_u256, default_value = "1")]
    pub min_stake: U256,

    /// Minimum unstake delay for entities.
    #[clap(long, value_parser=parse_u256, default_value = "0")]
    pub min_unstake_delay: U256,

    /// Minimum priority fee per gas.
    #[clap(long, value_parser=parse_u256, default_value = "0")]
    pub min_priority_fee_per_gas: U256,

    /// Addresses of whitelisted entities.
    #[clap(long, value_delimiter=',', value_parser = parse_address)]
    pub whitelist: Vec<Address>,

    /// User operation mempool mode
    #[clap(long, default_value = "standard", value_parser=parse_uopool_mode)]
    pub uopool_mode: UoPoolMode,
}

/// Common CLI args for bundler and uopool
#[derive(Debug, Clone, Parser)]
pub struct BundlerAndUoPoolArgs {
    /// Ethereum execution client RPC endpoint.
    // #[clap(long, default_value = "http://127.0.0.1:8545")]
    #[arg(long, short, default_value_t = String::from(""))]
    #[clap(long, env = "BUNDLER_RPC_URL")]
    pub eth_client_address: String,

    // Chain information.
    // #[clap(long, default_value = "sepolia")]
    // pub chain: Option<String>,
    #[arg(long, short, default_value_t = 1)]
    #[clap(long, env = "CHAIN_ID")]
    pub chain_id: u64,

    /// Entry point addresses.
    #[clap(long, value_delimiter=',', value_parser=parse_address)]
    pub entry_points: Vec<Address>,
}

/// RPC CLI args
#[derive(Debug, Clone, Parser, PartialEq)]
pub struct RpcArgs {
    /// Enables or disables the HTTP RPC.
    ///
    /// By default, this option is set to false.
    /// - To enable: `--http`.
    /// - To disable: no `--http` flag.
    #[clap(long)]
    pub http: bool,

    /// Sets the HTTP RPC address to listen on.
    ///
    /// By default, this option is set to `127.0.0.1`
    #[clap(long = "http.addr", default_value_t = IpAddr::V4(Ipv4Addr::LOCALHOST))]
    pub http_addr: IpAddr,

    /// Sets the HTTP RPC port to listen on.
    ///
    /// By default, this option is set to `3000`
    #[clap(long = "http.port", default_value_t = DEFAULT_HTTP_RPC_PORT)]
    pub http_port: u16,

    /// Configures the HTTP RPC API modules.
    #[clap(long = "http.api", value_delimiter=',', default_value = "eth", value_parser = ["eth", "debug", "web3"])]
    pub http_api: Vec<String>,

    /// Configures the allowed CORS domains.
    ///
    /// By default, this option is set to `*`.
    #[clap(long = "http.corsdomain", value_delimiter = ',', default_value = "*")]
    pub http_corsdomain: Vec<String>,

    /// Enables or disables the WebSocket RPC.
    ///
    /// By default, this option is set to false.
    /// - To enable: `--ws`
    /// - To disable: no `--ws` flag.
    #[clap(long)]
    pub ws: bool,

    /// Sets the WS RPC address to listen on.
    ///
    /// By default, this option is set to `127.0.0.1`
    #[clap(long = "ws.addr", default_value_t = IpAddr::V4(Ipv4Addr::LOCALHOST))]
    pub ws_addr: IpAddr,

    /// Sets the WS RPC port to listen on.
    ///
    /// By default, this option is set to `3001`
    #[clap(long = "ws.port", default_value_t = DEFAULT_WS_RPC_PORT)]
    pub ws_port: u16,

    /// Configures the WS RPC API modules.
    #[clap(long = "ws.api", value_delimiter=',', default_value = "eth", value_parser = ["eth", "debug", "web3"])]
    pub ws_api: Vec<String>,

    /// Configures the allowed WS origins.
    ///
    /// By default, this option is set to `*`.
    #[clap(long = "ws.origins", value_delimiter = ',', default_value = "*")]
    pub ws_origins: Vec<String>,
}

impl RpcArgs {
    /// Checks if either HTTP or WebSocket RPC is enabled.
    ///
    /// # Returns
    /// * `bool` - Returns `true` if either HTTP or WebSocket RPC is enabled, otherwise `false`.
    pub fn is_enabled(&self) -> bool {
        self.http || self.ws
    }

    /// Checks if the given API method is enabled.
    ///
    /// # Arguments
    /// * `method: &str` - The API method to check.
    ///
    /// # Returns
    /// * `bool` - Returns `true` if the given API method is enabled, otherwise `false`.
    pub fn is_api_method_enabled(&self, method: &str) -> bool {
        self.http_api.contains(&method.to_string()) || self.ws_api.contains(&method.to_string())
    }
}

/// Create wallet CLI args
#[derive(Debug, Clone, Parser)]
pub struct CreateWalletArgs {
    /// The path where the wallet will be stored.
    #[clap(long, short)]
    pub output_path: Option<ExpandedPathBuf>,

    /// The chain id.
    #[clap(long, value_parser=parse_u256, default_value="1")]
    pub chain_id: U256,

    /// Whether to create a Flashbots key.
    #[clap(long, default_value_t = false)]
    pub flashbots_key: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        net::{IpAddr, Ipv4Addr},
        str::FromStr,
    };

    #[test]
    fn bundler_args() {
        let args = vec![
            "bundlerargs",
            "--beneficiary",
            "0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990",
            "--min-balance",
            "100000000000000000",
            "--bundler.addr",
            "127.0.0.1",
            "--bundler.port",
            "3002",
            "--bundle-interval",
            "10",
        ];
        assert_eq!(
            BundlerArgs {
                beneficiary: Address::from_str("0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990")
                    .unwrap(),
                min_balance: U256::from(100000000000000000_u64),
                bundle_interval: 10,
                seed_phrase: String::from(""),
                send_bundle_mode: SendBundleMode::EthClient,
                bundler_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                bundler_port: 3002,
            },
            BundlerArgs::try_parse_from(args).unwrap()
        );
    }

    #[test]
    fn rpc_args_when_http_and_ws_flag() {
        let args = vec![
            "rpcargs",
            "--http",
            "--http.addr",
            "127.0.0.1",
            "--http.port",
            "3000",
            "--http.api",
            "eth,debug,web3",
            "--http.corsdomain",
            "127.0.0.1:4321",
            "--ws",
            "--ws.addr",
            "127.0.0.1",
            "--ws.port",
            "3001",
            "--ws.api",
            "eth,debug,web3",
            "--ws.origins",
            "127.0.0.1:4321",
        ];
        assert_eq!(
            RpcArgs {
                http: true,
                http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                http_port: 3000,
                http_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
                http_corsdomain: vec![String::from("127.0.0.1:4321")],
                ws: true,
                ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                ws_port: 3001,
                ws_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
                ws_origins: vec![String::from("127.0.0.1:4321")],
            },
            RpcArgs::try_parse_from(args).unwrap()
        );
    }

    #[test]
    fn rpc_args_when_http_is_true_ws_is_false() {
        let args = vec![
            "rpcargs",
            "--http",
            "--http.addr",
            "127.0.0.1",
            "--http.port",
            "3000",
            "--http.api",
            "eth,debug,web3",
            "--http.corsdomain",
            "127.0.0.1:4321",
        ];
        assert_eq!(
            RpcArgs {
                http: true,
                http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                http_port: 3000,
                http_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
                http_corsdomain: vec![String::from("127.0.0.1:4321")],
                ws: false,
                ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                ws_port: 3001,
                ws_api: vec![String::from("eth"),],
                ws_origins: vec![String::from("*")],
            },
            RpcArgs::try_parse_from(args).unwrap()
        );
    }

    #[test]
    fn rpc_args_when_http_is_false_ws_is_true() {
        let args = vec![
            "rpcargs",
            "--ws",
            "--ws.addr",
            "127.0.0.1",
            "--ws.port",
            "3001",
            "--ws.api",
            "eth,debug,web3",
            "--ws.origins",
            "127.0.0.1:4321",
        ];
        assert_eq!(
            RpcArgs {
                http: false,
                http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                http_port: 3000,
                http_api: vec![String::from("eth"),],
                http_corsdomain: vec![String::from("*")],
                ws: true,
                ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                ws_port: 3001,
                ws_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
                ws_origins: vec![String::from("127.0.0.1:4321")],
            },
            RpcArgs::try_parse_from(args).unwrap()
        );
    }

    #[test]
    fn rpc_args_when_no_http_and_ws_flag() {
        let args = vec![
            "rpcargs",
            "--http.addr",
            "127.0.0.1",
            "--http.port",
            "3000",
            "--http.api",
            "eth,debug,web3",
            "--http.corsdomain",
            "127.0.0.1:4321",
        ];
        assert_eq!(
            RpcArgs {
                http: false,
                http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                http_port: 3000,
                http_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
                http_corsdomain: vec![String::from("127.0.0.1:4321")],
                ws: false,
                ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
                ws_port: 3001,
                ws_api: vec![String::from("eth"),],
                ws_origins: vec![String::from("*")],
            },
            RpcArgs::try_parse_from(args).unwrap()
        );
    }

    #[test]
    fn is_enabled_return_true_when_only_http() {
        assert!(RpcArgs {
            http: true,
            http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            http_port: 3000,
            http_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
            http_corsdomain: vec![String::from("127.0.0.1:4321")],
            ws: false,
            ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            ws_port: 3001,
            ws_api: vec![String::from("eth"),],
            ws_origins: vec![String::from("*")],
        }
        .is_enabled());
    }

    #[test]
    fn is_enabled_return_true_when_only_ws() {
        assert!(RpcArgs {
            http: false,
            http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            http_port: 3000,
            http_api: vec![String::from("eth"),],
            http_corsdomain: vec![String::from("*")],
            ws: true,
            ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            ws_port: 3001,
            ws_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
            ws_origins: vec![String::from("127.0.0.1:4321")],
        }
        .is_enabled());
    }

    #[test]
    fn is_enabled_return_true_when_http_and_ws_are_true() {
        assert!(RpcArgs {
            http: true,
            http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            http_port: 3000,
            http_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
            http_corsdomain: vec![String::from("127.0.0.1:4321")],
            ws: true,
            ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            ws_port: 3001,
            ws_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
            ws_origins: vec![String::from("127.0.0.1:4321")],
        }
        .is_enabled());
    }

    #[test]
    fn is_enabled_return_false_when_http_and_ws_are_false() {
        assert!(!RpcArgs {
            http: false,
            http_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            http_port: 3000,
            http_api: vec![String::from("eth"), String::from("debug"), String::from("web3")],
            http_corsdomain: vec![String::from("127.0.0.1:4321")],
            ws: false,
            ws_addr: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            ws_port: 3001,
            ws_api: vec![String::from("eth"),],
            ws_origins: vec![String::from("*")],
        }
        .is_enabled());
    }
}
