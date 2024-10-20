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

use super::{
    error::TokenPriceError,
    types::{TokenPrice, TokenPriceDate},
};
use crate::{
    result::{AppError, AppJsonResult},
    tags::TOKEN_PRICE_TAG,
};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_db::models::token_price::{get_token_prices, TokenPriceAggregate};
use lightdotso_prisma::token;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use lightdotso_utils::is_testnet;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the token_price.
    pub address: String,
    /// The chain id of the token_price.
    pub chain_id: i64,
    /// The optional number of days to get the token_price for.
    pub days: Option<i32>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug, Deserialize)]
struct TokenPriceQueryReturnType {
    date: prisma_client_rust::chrono::DateTime<::prisma_client_rust::chrono::FixedOffset>,
    price: f64,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement FromTokenPriceQueryReturnType> for Token.
impl From<TokenPriceQueryReturnType> for TokenPriceDate {
    fn from(token_price_query: TokenPriceQueryReturnType) -> Self {
        Self { price: token_price_query.price, date: token_price_query.date.to_rfc3339() }
    }
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a token_price
///
/// Gets a token_price by address and chain id.
#[utoipa::path(
        get,
        path = "/token_price/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Token price returned successfully", body = TokenPrice),
            (status = 404, description = "Token price not found", body = TokenPriceError),
        ),
        tag = TOKEN_PRICE_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_token_price_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<TokenPrice> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get token for address: {:?}", query);
    let parsed_query_address: Address = query.address.parse()?;
    let checksum_address = parsed_query_address.to_checksum(None);
    let days = query.days.unwrap_or(30);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // If the chain id is a testnet, return a default token_price (empty)
    if is_testnet(query.chain_id as u64) {
        let token_price = TokenPrice::default();
        return Ok(Json::from(token_price));
    }

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the tokens from the database.
    let token = state
        .client
        .token()
        .find_unique(token::address_chain_id(checksum_address, query.chain_id))
        .exec()
        .await?;

    // If the token is not found, return a 404.
    let token = token.ok_or(AppError::NotFound)?;

    // Get the tokens from the database.
    let prices: Vec<TokenPriceAggregate> =
        get_token_prices(&state.pool, token.id, "1d", days).await?;
    info!("prices: {:?}", prices);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Get the price from the result array. Use the last price if the token does not have a price.
    // Use the average price if the token does not have a price and the result is empty.
    let price = prices.first().map(|x| x.price).unwrap_or(if !prices.is_empty() {
        prices[0].price
    } else {
        0.0
    });

    // Get the 24h price change from the result array.
    let price_change_24h = if prices.len() > 1 { prices[0].price - prices[1].price } else { 0.0 };

    // Calculate 24h price change percentage
    let price_change_24h_percentage = if prices.len() > 1 && prices[1].price != 0.0 {
        (price_change_24h / prices[1].price) * 100.0
    } else {
        0.0
    };

    // Construct the token_price.
    let token_price = TokenPrice {
        price,
        price_change_24h,
        price_change_24h_percentage,
        prices: prices.into_iter().map(|x| x.into()).collect(),
        token: None,
    };

    Ok(Json::from(token_price))
}
