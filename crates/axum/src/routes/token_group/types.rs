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
}

/// Implement From<token_group::Data> for TokenGroup.
impl From<token_group::Data> for TokenGroup {
    fn from(token_group: token_group::Data) -> Self {
        Self { id: token_group.id }
    }
}
