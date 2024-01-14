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

use lightdotso_prisma::interpretation;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Interpretation root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Interpretation {
    /// The id of the interpretation to read for.
    id: String,
    /// The array of actions of the interpretation.
    actions: Vec<String>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<interpretation::Data> for Interpretation.
impl From<interpretation::Data> for Interpretation {
    fn from(interpretation: interpretation::Data) -> Self {
        Self {
            id: interpretation.id,
            actions: interpretation
                .actions
                .unwrap_or_default()
                .into_iter()
                .map(|action| action.action)
                .collect(),
        }
    }
}
