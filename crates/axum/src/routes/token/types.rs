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

#![allow(clippy::unwrap_used)]

use lightdotso_prisma::{token, wallet_balance};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Token root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Token {
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
}

/// Implement From<token::Data> for Token.
impl From<token::Data> for Token {
    fn from(token: token::Data) -> Self {
        Self {
            address: token.address,
            chain_id: token.chain_id,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            amount: 0,
            balance_usd: 0.0,
        }
    }
}

/// Implement From<wallet_balance:Data> for Token.
impl From<wallet_balance::Data> for Token {
    fn from(balance: wallet_balance::Data) -> Self {
        Self {
            address: balance.token.clone().unwrap().unwrap().address,
            chain_id: balance.chain_id,
            name: balance.token.clone().unwrap().unwrap().name,
            symbol: balance.token.clone().unwrap().unwrap().symbol,
            decimals: balance.token.clone().unwrap().unwrap().decimals,
            amount: balance.amount.unwrap(),
            balance_usd: balance.balance_usd,
        }
    }
}
