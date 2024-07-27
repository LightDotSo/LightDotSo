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

use eyre::Result;
use reqwest::Client;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::sync::Arc;

use crate::{constants::MINI_CRYPTO_BASE_API_URL, get_api_json_response};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
pub struct CryptoResponse {
    #[serde(rename = "USD")]
    usd: f64,
}

// Construct the mini crypto url and exponential backoff
pub async fn request_mini_crypto_api_text<T: DeserializeOwned>(path: String) -> Result<T> {
    // Create a new reqwest client
    let client = Arc::new(Client::new());

    // Construct the mini crypto url
    let url = MINI_CRYPTO_BASE_API_URL.to_string() + &path;

    // Get the response from the mini crypto api
    let response = get_api_json_response::<T>(client, url.to_string(), None).await?;

    Ok(response)
}

// Get the price of native token
pub async fn get_native_token_price(_chain_id: u64) -> Result<f64> {
    // The path to the native token price
    let path = format!("/data/price?fsym={}&tsyms=USD", "ETH");

    // Get the response from the api
    let response = request_mini_crypto_api_text::<CryptoResponse>(path).await?;

    Ok(response.usd)
}

// Write the tests
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_native_token_price() {
        let price = get_native_token_price(1).await.unwrap();
        assert!(price > 0.0);
    }
}
