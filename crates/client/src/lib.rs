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

#![allow(clippy::unwrap_used)]

pub mod constants;
pub mod crypto;

use alloy::primitives::B256;
use backon::{ExponentialBuilder, Retryable};
use constants::{ADMIN_BASE_API_URL, PUBLIC_BASE_API_URL};
use eyre::Result;
use http::HeaderMap;
use lightdotso_common::traits::HexToBytes;
use lightdotso_tracing::tracing::info;
use reqwest::Client;
use serde::de::DeserializeOwned;
use std::sync::Arc;

/// Get the api json response
pub async fn get_api_json_response<T: DeserializeOwned>(
    client: Arc<Client>,
    url: String,
    headers: Option<HeaderMap>,
) -> Result<T, reqwest::Error> {
    // Get the api json response
    let response =
        client.get(url).headers(headers.unwrap_or_default()).send().await?.json::<T>().await?;

    Ok(response)
}

/// Get the api text response
pub async fn get_api_text_response(
    client: Arc<Client>,
    url: String,
    headers: Option<HeaderMap>,
) -> Result<String> {
    // Get the api text response
    let response =
        client.get(url).headers(headers.unwrap_or_default()).send().await?.text().await?;

    Ok(response)
}

/// Construct the api.light.so url and exponential backoff
pub async fn request_api_json<T: DeserializeOwned>(path: String) -> Result<T> {
    // Create a new reqwest client
    let client = Arc::new(Client::new());

    // Check if there is an environment variable, `LIGHT_ADMIN_TOKEN`, if so set that to
    // Authorization header
    let mut headers = HeaderMap::new();
    if let Ok(token) = std::env::var("LIGHT_ADMIN_TOKEN") {
        headers.insert("Authorization", token.parse().unwrap());
    }

    // Try the admin api url if the header is set
    if !headers.is_empty() {
        let url = ADMIN_BASE_API_URL.to_string() + &path;
        let res = {
            || get_api_json_response::<T>(client.clone(), url.to_string(), Some(headers.clone()))
        }
        .retry(ExponentialBuilder::default())
        .await;

        // Return the response if it is Ok
        if let Ok(response) = res {
            return Ok(response);
        }
    }

    // Try the public api url if the header is not set
    let url = PUBLIC_BASE_API_URL.to_string() + &path;
    let response = get_api_json_response(client, url.to_string(), None).await?;

    Ok(response)
}

// Get the signature of the user operation
pub async fn get_user_operation_signature(
    hash: B256,
    configuration_id: Option<String>,
) -> Result<Vec<u8>> {
    // The path to the user operation signature
    let path = format!("/user_operation/signature?user_operation_hash={:?}", hash,);

    // If the configuration id is present, append it to the path
    let path = if let Some(configuration_id) = configuration_id {
        format!("{}&configuration_id={}", path, configuration_id)
    } else {
        path
    };
    info!("path: {}", path);

    // Get the response from the api
    let response = request_api_json::<String>(path).await?;
    info!("response: {}", response);

    // Convert to GasEstimation using From trait
    Ok(response.hex_to_bytes()?)
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_user_operation_signature() {
        // Run the test
        let hash =
            "0x76ed9304a5c7de17666abbc35d9c36a3aa83e54a9e1f8e23d564e808fbcb3c98".parse().unwrap();
        let configuration_id = None;
        let result = get_user_operation_signature(hash, configuration_id).await;

        // Print the result
        println!("{:?}", result);

        // Check if the result is Ok
        assert!(result.is_ok());
    }
}
