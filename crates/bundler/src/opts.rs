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

use crate::utils::{parse_address, parse_u256, parse_uopool_mode};
use clap::Parser;
use ethers::types::{Address, U256};
use silius_primitives::UoPoolMode;
use std::net::SocketAddr;

#[derive(Clone, Debug, Parser, PartialEq)]
pub struct UoPoolServiceOpts {
    #[clap(long, default_value = "127.0.0.1:3001")]
    pub uopool_grpc_listen_address: SocketAddr,

    #[clap(long, value_parser=parse_u256, default_value = "1")]
    pub min_stake: U256,

    #[clap(long, value_parser=parse_u256, default_value = "0")]
    pub min_unstake_delay: U256,

    #[clap(long, value_parser=parse_u256, default_value = "0")]
    pub min_priority_fee_per_gas: U256,

    #[clap(long, value_delimiter=',', value_parser = parse_address)]
    pub whitelist: Vec<Address>,

    #[clap(long, default_value = "standard", value_parser=parse_uopool_mode)]
    pub uo_pool_mode: UoPoolMode,
}

#[derive(Clone, Debug, Parser, PartialEq)]
pub struct BundlerServiceOpts {
    #[clap(long, default_value = "100000000000000000", value_parser=parse_u256)]
    pub min_balance: U256,

    #[clap(long, default_value = "127.0.0.1:3002")]
    pub bundler_grpc_listen_address: SocketAddr,

    #[clap(long, default_value = "10")]
    pub bundle_interval: u64,
}

#[derive(Clone, Debug, Parser, PartialEq)]
pub struct RpcServiceOpts {
    #[clap(long, default_value = "127.0.0.1:3000")]
    pub rpc_listen_address: String,

    #[clap(long, value_delimiter = ',', default_value = "*")]
    pub cors_domain: Vec<String>,
}
