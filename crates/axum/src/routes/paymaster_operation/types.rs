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

use lightdotso_prisma::paymaster_operation;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// PaymasterOperation root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct PaymasterOperation {
    /// The id of the paymaster operation.
    id: String,
}

/// Implement From<paymaster_operation::Data> for PaymasterOperation.
impl From<paymaster_operation::Data> for PaymasterOperation {
    fn from(paymaster_operation: paymaster_operation::Data) -> Self {
        Self { id: paymaster_operation.id }
    }
}
