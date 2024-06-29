// Copyright 2023-2024 Light
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
}

impl Default for TokenPrice {
    fn default() -> Self {
        Self {
            price: 0.0,
            price_change_24h: 0.0,
            price_change_24h_percentage: 0.0,
            prices: Vec::new(),
        }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenPriceDate {
    /// The price of the token price.
    pub price: f64,
    /// The date of the token price.
    pub date: String,
}
