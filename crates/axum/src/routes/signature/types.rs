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

use lightdotso_common::traits::VecU8ToHex;
use lightdotso_prisma::signature;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Signature root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Signature {
    /// The signature of the user operation in hex.
    pub signature: String,
    /// The type of the signature.
    pub signature_type: i32,
    /// The owner id of the signature.
    pub owner_id: String,
}

/// Implement From<signature::Data> for Signature.
impl From<signature::Data> for Signature {
    fn from(signature: signature::Data) -> Self {
        Self {
            signature: signature.signature.to_hex_string(),
            signature_type: signature.signature_type,
            owner_id: signature.owner_id.to_string(),
        }
    }
}
