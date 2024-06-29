// Copyright 2023-2024 Light.
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

use ethers::providers::{Http, Middleware, Provider};
use eyre::{eyre, Result};

/// Returns a provider for the given chain ID w/ fallbacks
pub async fn get_provider(chain_id: u64) -> Result<Provider<Http>> {
    // If env `ENVIRONMENT` is `development`, use the local anvil fork
    let internal_rpc_url = "http://localhost:8545".to_string();
    if std::env::var("ENVIRONMENT").unwrap_or_default() == "development" {
        if let Ok(provider) = Provider::<Http>::try_from(internal_rpc_url.as_str()) {
            if provider.get_block_number().await.is_ok() {
                return Ok(provider);
            }
        }
    }

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
