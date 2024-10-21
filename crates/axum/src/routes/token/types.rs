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

use lightdotso_db::models::wallet_balance::WalletBalance;
use lightdotso_prisma::{token, wallet_balance};
use lightdotso_utils::is_testnet;
use prisma_client_rust::bigdecimal::ToPrimitive;
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
    pub amount: String,
    /// The balance of the token in USD.
    pub balance_usd: f64,
    /// The logo url of the token.
    pub logo_url: Option<String>,
    /// The type of the token.
    pub token_type: Option<String>,
    /// The group of the token.
    pub group: Option<TokenGroup>,
    /// The flag to indicate if the token is a spam token.
    pub is_spam: bool,
    /// The flag to indicate if the token is on a testnet.
    pub is_testnet: bool,
}

/// Token group root type.
#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenGroup {
    /// The id of the token group.
    pub id: String,
    /// The tokens of the token group.
    #[schema(no_recursion)]
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
            amount: "0".to_string(),
            balance_usd: 0.0,
            logo_url: token.logo_url,
            token_type: Some(token.r#type.to_string()),
            group: token.group.and_then(|group| {
                group.map(|group_data| TokenGroup {
                    id: group_data.id,
                    tokens: group_data
                        .tokens
                        .map(|tokens| tokens.into_iter().map(Token::from).collect())
                        .unwrap_or_default(),
                })
            }),
            is_spam: false,
            is_testnet: is_testnet(token.chain_id as u64),
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
            amount: balance.amount.map(|amount| amount.to_string()).unwrap_or_default(),
            balance_usd: balance.balance_usd,
            logo_url: balance.token.clone().unwrap().unwrap().logo_url,
            token_type: None,
            group: balance.token.clone().unwrap().unwrap().group.and_then(|group| {
                group.map(|group_data| TokenGroup { id: group_data.id, tokens: vec![] })
            }),
            is_spam: balance.is_spam,
            is_testnet: balance.is_testnet,
        }
    }
}

/// Implement From<WalletBalance> for Token.
impl From<WalletBalance> for Token {
    fn from(balance: WalletBalance) -> Self {
        Self {
            id: balance.token_id,
            address: balance.wallet_address,
            chain_id: balance.chain_id.to_i64().unwrap_or_default(),
            name: None,
            symbol: "".to_string(),
            decimals: 0,
            amount: balance.amount.to_string(),
            balance_usd: balance.balance_usd.to_f64().unwrap_or_default(),
            logo_url: None,
            token_type: None,
            group: None,
            is_spam: balance.is_spam,
            is_testnet: balance.is_testnet,
        }
    }
}
