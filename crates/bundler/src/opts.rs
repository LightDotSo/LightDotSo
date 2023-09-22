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

// Entire file and code is from: https://github.com/Vid201/silius/blob/ea49b426d19f848e422d1fc3a7557ddb9f485cf7/bin/silius/src/cli.rs
// License: MIT or Apache-2.0
use crate::utils::{parse_address, parse_u256, parse_uopool_mode};
use clap::Parser;
use ethers::types::{Address, U256};
use silius_primitives::{
    consts::networking::{DEFAULT_BUNDLER_GRPC_PORT, DEFAULT_UOPOOL_GRPC_PORT},
    UoPoolMode,
};
use std::net::{IpAddr, Ipv6Addr};

#[derive(Clone, Debug, Parser, PartialEq)]
pub struct UoPoolOpts {
    /// UoPool gRPC address to listen on.
    #[clap(long = "uopool.addr", default_value_t = IpAddr::V6(Ipv6Addr::LOCALHOST))]
    pub uopool_addr: IpAddr,

    /// UoPool gRPC port to listen on.
    #[clap(long = "uopool.port", default_value_t = DEFAULT_UOPOOL_GRPC_PORT)]
    pub uopool_port: u16,

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

/// Bundler CLI args
#[derive(Debug, Clone, Parser, PartialEq)]
pub struct BundlerOpts {
    /// Bundler gRPC address to listen on.
    #[clap(long = "bundler.addr", default_value_t = IpAddr::V6(Ipv6Addr::LOCALHOST))]
    pub bundler_addr: IpAddr,

    /// Bundler gRPC port to listen on.
    #[clap(long = "bundler.port", default_value_t = DEFAULT_BUNDLER_GRPC_PORT)]
    pub bundler_port: u16,

    /// The bundler beneficiary address.
    #[clap(long, value_parser=parse_address)]
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
}
