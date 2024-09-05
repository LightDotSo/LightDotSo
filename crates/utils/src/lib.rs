// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use alloy::primitives::{Address, U256};
/// Entire file is copied from https://github.com/Vid201/silius/blob/bc8b7b0039c9a2b02256fefc7eed3b2efc94bf96/bin/silius/src/utils.rs
use lightdotso_constants::chains::{
    CHAIN_BLOCK_SECONDS, DEFAULT_CHAIN_BLOCK_SECONDS, DEFAULT_TESTNET_CHAIN_BLOCK_SECONDS,
    MAINNET_CHAIN_IDS, NATIVE_TOKEN_SYMBOLS, TESTNET_CHAIN_IDS,
};
/// License: MIT or Apache-2.0
use std::str::FromStr;

/// Parses address from string
pub fn parse_address(s: &str) -> Result<Address, String> {
    Address::from_str(s).map_err(|_| format!("String {s} is not a valid address"))
}

/// Parses U256 from string
pub fn parse_u256(s: &str) -> Result<U256, String> {
    U256::from_str_radix(s, 10).map_err(|_| format!("String {s} is not a valid U256"))
}

/// Utility function to get the native token symbol for a given chain ID.
/// Returns a fallback message for chains that use ETH or are not listed.
pub fn get_native_token_symbol(chain_id: u64) -> &'static str {
    NATIVE_TOKEN_SYMBOLS.get(&chain_id).unwrap_or(&"ETH")
}

/// Returns `true` if the chain ID is a testnet chain ID.
/// Falls back to `true` if the chain ID is not a mainnet chain ID.
pub fn is_testnet(chain_id: u64) -> bool {
    TESTNET_CHAIN_IDS.contains_key(&chain_id) || !MAINNET_CHAIN_IDS.contains_key(&chain_id)
}

/// Get the chain seconds to sleep for a given chain ID.
/// Returns a fallback value for chains that are not listed.
pub fn get_chain_block_seconds(chain_id: u64) -> u64 {
    *CHAIN_BLOCK_SECONDS.get(&chain_id).unwrap_or(if !is_testnet(chain_id) {
        &*DEFAULT_CHAIN_BLOCK_SECONDS
    } else {
        &*DEFAULT_TESTNET_CHAIN_BLOCK_SECONDS
    })
}
