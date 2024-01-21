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
            amount: asset_change.amount,
            before_amount: asset_change.before_amount,
            after_amount: asset_change.after_amount,
            action: asset_change.interpretation_action.and_then(|maybe_action| {
                maybe_action.map(|action| InterpretationAction::from(*action))
            }),
            token: asset_change
                .token
                .and_then(|maybe_token| maybe_token.map(|token| Token::from(*token))),
        }
    }
}
