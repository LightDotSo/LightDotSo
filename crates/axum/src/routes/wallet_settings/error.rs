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

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Error
// -----------------------------------------------------------------------------

/// WalletSettings operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum WalletSettingsError {
    // WalletSettings query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// WalletSettings not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}
