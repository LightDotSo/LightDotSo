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

// Heavily inspired by: https://github.com/mark-ruddy/covctl
// License: MIT

use constants::COVALENT_BASE_URL;
use eyre::{Result, WrapErr};
use reqwest::Response;
use types::{BalancesData, TransactionsData};

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
fn get_api_key() -> Result<String> {
    std::env::var("COVALENT_API_KEY")
        .wrap_err("Could not read COVALENT_API_KEY from environment variables")
}

/// Get token balance information for an address
pub async fn get_token_balances(
    chain_id: &str,
    addr: &str,
    page_size: Option<String>,
    page_number: Option<String>,
) -> Result<BalancesData> {
    let api_key = get_api_key()?;

    let mut endpoint = format!(
        "{}/{}/address/{}/balances_v2/?key={}",
        *COVALENT_BASE_URL, chain_id, addr, api_key
    );
    endpoint = add_pagination_params(endpoint, page_size, page_number);
    let resp = make_request(&endpoint).await?;

    let resource: BalancesData = resp.json().await?;
    Ok(resource)
}

/// Get transactions for an address
pub async fn get_transactions(
    chain_id: &str,
    addr: &str,
    page_size: Option<String>,
    page_number: Option<String>,
) -> Result<TransactionsData> {
    let api_key = get_api_key()?;

    let mut endpoint = format!(
        "{}/{}/address/{}/transactions_v2/?key={}",
        *COVALENT_BASE_URL, chain_id, addr, api_key
    );
    endpoint = add_pagination_params(endpoint, page_size, page_number);

    let resp = make_request(&endpoint).await?;
    let resource: TransactionsData = resp.json().await?;
    Ok(resource)
}
