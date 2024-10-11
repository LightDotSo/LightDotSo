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

use alloy::{
    network::{Ethereum, EthereumWallet},
    providers::{
        fillers::{
            BlobGasFiller, ChainIdFiller, FillProvider, GasFiller, JoinFill, NonceFiller,
            WalletFiller,
        },
        Identity, Provider, ProviderBuilder, RootProvider,
    },
    transports::{http::Http, BoxTransport},
};
use eyre::{eyre, Result};
use reqwest::Client;

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

/// Returns a provider for the given chain ID w/ fallbacks
pub async fn get_provider(chain_id: u64) -> Result<(RootProvider<BoxTransport>, String)> {
    // If env `ENVIRONMENT` is `development`, use the local anvil fork
    let internal_rpc_url = "http://localhost:8545".to_string();
    if std::env::var("ENVIRONMENT").unwrap_or_default() == "development" {
        if let Ok(provider) = ProviderBuilder::new().on_builtin(internal_rpc_url.as_str()).await {
            if provider.get_block_number().await.is_ok() {
                return Ok((provider, internal_rpc_url));
            }
        }
    }

    // Primary RPC URL
    let rpc_url_1 = format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", chain_id);
    if let Ok(provider) = ProviderBuilder::new().on_builtin(rpc_url_1.as_str()).await {
        if provider.get_block_number().await.is_ok() {
            return Ok((provider, rpc_url_1));
        }
    }

    // Fallback Internal RPC URL
    let rpc_url_2 = format!("http://lightdotso-rpc.internal:3000/internal/{}", chain_id);
    if let Ok(provider) = ProviderBuilder::new().on_builtin(rpc_url_2.as_str()).await {
        if provider.get_block_number().await.is_ok() {
            return Ok((provider, rpc_url_2));
        }
    }

    // If `PROTECTED_RPC_URL` is set, concatenate the chain ID and try to connect
    // to that RPC URL.
    if let Ok(protected_rpc_url) = std::env::var("PROTECTED_RPC_URL") {
        let rpc_url_2 = format!("{}/{}", protected_rpc_url, chain_id);
        if let Ok(provider) = ProviderBuilder::new().on_builtin(rpc_url_2.as_str()).await {
            if provider.get_block_number().await.is_ok() {
                return Ok((provider, rpc_url_2));
            }
        }
    }

    // Fallback Public RPC URL
    let rpc_url_3 = format!("https://rpc.light.so/{}", chain_id);
    if let Ok(provider) = ProviderBuilder::new().on_builtin(rpc_url_3.as_str()).await {
        if provider.get_block_number().await.is_ok() {
            return Ok((provider, rpc_url_3));
        }
    }

    // If all attempts fail, return error message
    Err(eyre!("Could not connect to any RPC URL"))
}

pub async fn get_provider_with_wallet(
    chain_id: u64,
    wallet: EthereumWallet,
) -> Result<(
    FillProvider<
        JoinFill<
            JoinFill<
                Identity,
                JoinFill<GasFiller, JoinFill<BlobGasFiller, JoinFill<NonceFiller, ChainIdFiller>>>,
            >,
            WalletFiller<EthereumWallet>,
        >,
        RootProvider<Http<Client>>,
        Http<Client>,
        Ethereum,
    >,
    String,
)> {
    let (_, rpc_url) = get_provider(chain_id).await?;
    let provider =
        ProviderBuilder::new().with_recommended_fillers().wallet(wallet).on_http(rpc_url.parse()?);
    Ok((provider, rpc_url))
}
