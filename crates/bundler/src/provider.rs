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

use ethers::providers::{Http, Middleware, Provider};
use eyre::{eyre, Result};

// FIXME: This is a temporary solution to get the provider in compatible ethers-rs
// Copy from the file: crates/contracts/src/provider.rs

/// Returns a provider for the given chain ID w/ fallbacks
pub async fn get_provider(chain_id: u64) -> Result<Provider<Http>> {
    // Primary RPC URL
    let rpc_url_1 = format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", chain_id);
    if let Ok(provider) = Provider::<Http>::try_from(rpc_url_1.as_str()) {
        if provider.get_block_number().await.is_ok() {
            return Ok(provider);
        }
    }

    // If `PROTECTED_RPC_URL` is set, concatenate the chain ID and try to connect
    // to that RPC URL.
    if let Ok(protected_rpc_url) = std::env::var("PROTECTED_RPC_URL") {
        let rpc_url_2 = format!("{}/{}", protected_rpc_url, chain_id);
        if let Ok(provider) = Provider::<Http>::try_from(rpc_url_2.as_str()) {
            if provider.get_block_number().await.is_ok() {
                return Ok(provider);
            }
        }
    }

    // Fallback Public RPC URL
    let rpc_url_3 = format!("https://rpc.light.so/{}", chain_id);
    if let Ok(provider) = Provider::<Http>::try_from(rpc_url_3.as_str()) {
        if provider.get_block_number().await.is_ok() {
            return Ok(provider);
        }
    }

    // If all attempts fail, return error message
    Err(eyre!("Could not connect to any RPC URL"))
}
