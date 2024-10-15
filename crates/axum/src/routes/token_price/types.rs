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

use crate::routes::token::types::Token;
use lightdotso_db::models::token_price::TokenPriceAggregate;
use lightdotso_prisma::token_price;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// TokenPrice root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenPrice {
    /// The price of the token price.
    pub price: f64,
    /// The change of the token price in the last 24 hours.
    pub price_change_24h: f64,
    /// The percentage change of the token price in the last 24 hours.
    pub price_change_24h_percentage: f64,
    /// The historical prices of the token price.
    pub prices: Vec<TokenPriceDate>,
    /// The token.
    pub token: Option<Token>,
}

impl Default for TokenPrice {
    fn default() -> Self {
        Self {
            price: 0.0,
            price_change_24h: 0.0,
            price_change_24h_percentage: 0.0,
            prices: Vec::new(),
            token: None,
        }
    }
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<token_price::Data> for TokenPrice.
impl From<token_price::Data> for TokenPrice {
    fn from(token_price: token_price::Data) -> Self {
        Self {
            price: token_price.price,
            token: token_price.token.map(|token| Token::from(*token)),
            ..Default::default()
        }
    }
}

/// Implement From<TokenPriceAggregate> for TokenPriceDate.
impl From<TokenPriceAggregate> for TokenPriceDate {
    fn from(token_price: TokenPriceAggregate) -> Self {
        Self { price: token_price.price, date: token_price.date.to_string() }
    }
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenPriceDate {
    /// The price of the token price.
    pub price: f64,
    /// The date of the token price.
    pub date: String,
}
