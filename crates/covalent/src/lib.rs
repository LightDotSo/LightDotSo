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

// Heavily inspired by: https://github.com/mark-ruddy/covctl
// License: MIT

use constants::COVALENT_BASE_URL;
use eyre::Result;
use eyre::WrapErr;
use lightdotso_tracing::tracing::info;
use reqwest::Response;
use types::BalancesData;
use types::TransactionsData;

pub mod constants;
pub mod types;

// From: https://github.com/mark-ruddy/covctl/blob/5539c2722c7267276b85334e646c3e59df6158d1/covalent_class_a/src/lib.rs#L8
// License: MIT
/// Makes a request to the Covalent API
async fn make_request(url: &str) -> Result<Response> {
    info!("Sending API request to: {}", url);
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
    println!("{}", endpoint);

    let resp = make_request(&endpoint).await?;
    println!("{:#?}", resp);
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
