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

// Heavily inspired by: https://github.com/mark-ruddy/covctl
// License: MIT

use constants::ROUTESCAN_BASE_URL;
use eyre::Result;
use lightdotso_contracts::utils::is_testnet;
use reqwest::Response;
use serde_json::Value;
use types::{BalancesData, NativeBalanceData};

pub mod constants;
pub mod types;

// From: https://github.com/mark-ruddy/covctl/blob/5539c2722c7267276b85334e646c3e59df6158d1/covalent_class_a/src/lib.rs#L8
// License: MIT
/// Makes a request to the Covalent API
async fn make_request(url: &str) -> Result<Response> {
    let resp = reqwest::get(url).await?;
    Ok(resp)
}

// From: https://github.com/mark-ruddy/covctl/blob/5539c2722c7267276b85334e646c3e59df6158d1/covalent_class_a/src/lib.rs#L31C1-L43C2
// License: MIT
/// Add pagination parameters to an endpoint
fn add_pagination_params(
    mut endpoint: String,
    page_size: Option<String>,
    page_number: Option<String>,
) -> String {
    if let Some(size) = page_size {
        endpoint = format!("{}&page-size={}", endpoint, size)
    }

    if let Some(num) = page_number {
        endpoint = format!("{}&page-number={}", endpoint, num)
    }

    endpoint
}

/// Gets the Covalent API key from the environment
// fn get_api_key() -> Result<String> {
//     std::env::var("ROUTESCAN_API_KEY")
//         .wrap_err("Could not read ROUTESCAN_API_KEY from environment variables")
// }

/// Get token balance information for an address
pub async fn get_native_balance(chain_id: &u64, addr: &str) -> Result<NativeBalanceData> {
    // let _api_key = get_api_key()?;

    let is_testnet_str = if is_testnet(*chain_id) { "testnet" } else { "mainnet" };

    let endpoint = format!(
        "{}/network/{}/evm/{}/etherscan/api?module=account&action=balance&tag=latest&address={}",
        *ROUTESCAN_BASE_URL, is_testnet_str, chain_id, addr,
    );
    println!("endpoint: {}", endpoint);

    let resp = make_request(&endpoint).await?;

    let mut value: Value = resp.json().await?;

    if let Some(result_value) = value.get_mut("result") {
        if let Value::String(s) = result_value {
            let result_i64 = s.parse::<i64>()?;
            *result_value = Value::Number(serde_json::Number::from(result_i64));
        }
    }
    let resource: NativeBalanceData = serde_json::from_value(value)?;

    Ok(resource)
}

/// Get token balance information for an address
pub async fn get_token_balances(
    chain_id: &u64,
    addr: &str,
    page_size: Option<String>,
    page_number: Option<String>,
) -> Result<BalancesData> {
    // let _api_key = get_api_key()?;

    let is_testnet_str = if is_testnet(*chain_id) { "testnet" } else { "mainnet" };

    let mut endpoint = format!(
        "{}/network/{}/evm/{}/address/{}/erc20-holdings",
        *ROUTESCAN_BASE_URL, is_testnet_str, chain_id, addr,
    );
    println!("endpoint: {}", endpoint);

    endpoint = add_pagination_params(endpoint, page_size, page_number);
    let resp = make_request(&endpoint).await?;

    let resource: BalancesData = resp.json().await?;
    Ok(resource)
}
