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

use lightdotso_prisma::{token, wallet_balance};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Token root type.
#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Token {
    /// The id of the token.
    pub id: String,
    /// The address of the token.
    pub address: String,
    /// The chain id of the token.
    pub chain_id: i64,
    /// The name of the token.
    pub name: Option<String>,
    /// The symbol of the token.
    pub symbol: String,
    /// The decimals of the token.
    pub decimals: i32,
    /// The amount of the token.
    pub amount: i64,
    /// The balance of the token in USD.
    pub balance_usd: f64,
    /// The type of the token.
    pub token_type: Option<String>,
    /// The group of the token.
    pub group: Option<TokenGroup>,
}

/// Token group root type.
#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenGroup {
    /// The id of the token group.
    pub id: String,
    /// The tokens of the token group.
    pub tokens: Vec<Token>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<token::Data> for Token.
impl From<token::Data> for Token {
    fn from(token: token::Data) -> Self {
        Self {
            id: token.id,
            address: token.address,
            chain_id: token.chain_id,
            name: token.name,
            symbol: token.symbol.unwrap_or("".to_string()),
            decimals: token.decimals.unwrap_or(0),
            amount: 0,
            balance_usd: 0.0,
            token_type: Some(token.r#type.to_string()),
            group: token.group.and_then(|group| {
                group.map(|group_data| TokenGroup { id: group_data.id, tokens: vec![] })
            }),
        }
    }
}

/// Implement From<wallet_balance:Data> for Token.
impl From<wallet_balance::Data> for Token {
    fn from(balance: wallet_balance::Data) -> Self {
        Self {
            // Note that unwrap() is safe here because we have made sure to fetch
            // the token and the goken group for all wallet_balance fetches.
            id: balance.token.clone().unwrap().unwrap().id,
            address: balance.token.clone().unwrap().unwrap().address,
            chain_id: balance.chain_id,
            name: balance.token.clone().unwrap().unwrap().name,
            symbol: balance.token.clone().unwrap().unwrap().symbol.unwrap_or("".to_string()),
            decimals: balance.token.clone().unwrap().unwrap().decimals.unwrap_or(0),
            amount: balance
                .amount
                .and_then(|amount_str| amount_str.parse::<i64>().ok())
                .unwrap_or_default(),
            balance_usd: balance.balance_usd,
            token_type: None,
            group: balance.token.clone().unwrap().unwrap().group.and_then(|group| {
                group.map(|group_data| TokenGroup { id: group_data.id, tokens: vec![] })
            }),
        }
    }
}
