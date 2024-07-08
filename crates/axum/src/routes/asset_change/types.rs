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

use crate::routes::{interpretation_action::types::InterpretationAction, token::types::Token};
use lightdotso_prisma::asset_change;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// AssetChange root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct AssetChange {
    /// The id of the asset change.
    id: String,
    /// The address of the asset change.
    address: String,
    /// The amount of the asset change.
    amount: i64,
    /// The before amount of the asset change.
    before_amount: Option<i64>,
    /// The after amount of the asset change.
    after_amount: Option<i64>,
    /// The action id of the asset change.
    action: Option<InterpretationAction>,
    /// The token id of the asset change.
    token: Option<Token>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<asset_change::Data> for AssetChange.
impl From<asset_change::Data> for AssetChange {
    fn from(asset_change: asset_change::Data) -> Self {
        Self {
            id: asset_change.id,
            address: asset_change.address,
            amount: asset_change.amount.parse().unwrap_or_default(),
            before_amount: asset_change.before_amount.and_then(|s| s.parse::<i64>().ok()),
            after_amount: asset_change.after_amount.and_then(|s| s.parse::<i64>().ok()),
            action: asset_change.interpretation_action.and_then(|maybe_action| {
                maybe_action.map(|action| InterpretationAction::from(*action))
            }),
            token: asset_change
                .token
                .and_then(|maybe_token| maybe_token.map(|token| Token::from(*token))),
        }
    }
}
