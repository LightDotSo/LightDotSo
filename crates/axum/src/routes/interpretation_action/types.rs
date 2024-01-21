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

use lightdotso_prisma::interpretation_action;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// InterpretationAction root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct InterpretationAction {
    /// The id of the interpretation action.
    id: String,
    /// The action of the interpretation action.
    action: String,
    /// The status of the interpretation action.
    address: String,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<interpretation_action::Data> for InterpretationAction.
impl From<interpretation_action::Data> for InterpretationAction {
    fn from(interpretation_action: interpretation_action::Data) -> Self {
        Self {
            id: interpretation_action.id,
            action: interpretation_action.action,
            address: interpretation_action.address,
        }
    }
}
