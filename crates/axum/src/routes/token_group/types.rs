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
use lightdotso_prisma::token_group;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// TokenGroup root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct TokenGroup {
    /// The id of the token group.
    id: String,
    /// The array of tokens in the token group.
    tokens: Vec<Token>,
    /// The address of the token (may differ between chains but okay for now)
    pub address: String,
    /// The name of the token group.
    pub name: Option<String>,
    /// The symbol of the token group.
    pub symbol: String,
    /// The decimals of the token group.
    pub decimals: i32,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<token_group::Data> for TokenGroup.
impl From<token_group::Data> for TokenGroup {
    fn from(token_group: token_group::Data) -> Self {
        Self {
            id: token_group.id,
            tokens: token_group
                .tokens
                .clone()
                .map_or(Vec::new(), |tokens| tokens.into_iter().map(Token::from).collect()),
            // Fetch the first token to get the below fields
            address: token_group
                .tokens
                .clone()
                .map_or(String::new(), |tokens| tokens.first().unwrap().address.clone()),
            name: token_group
                .tokens
                .clone()
                .and_then(|tokens| tokens.first().unwrap().name.clone()),
            decimals: token_group
                .tokens
                .clone()
                .map_or(0, |tokens| tokens.first().unwrap().decimals.unwrap_or(0)),
            symbol: token_group.tokens.map_or(String::new(), |tokens| {
                tokens.first().unwrap().symbol.clone().unwrap_or_default()
            }),
        }
    }
}
