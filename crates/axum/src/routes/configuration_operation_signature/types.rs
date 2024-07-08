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

use lightdotso_common::traits::VecU8ToHex;
use lightdotso_prisma::configuration_operation_signature;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Signature root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct ConfigurationOperationSignature {
    /// The id of the owner of the signature.
    pub owner_id: String,
    /// The signature of the user operation in hex.
    pub signature: String,
    /// The created time of the signature.
    pub created_at: String,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<signature::Data> for Signature.
impl From<configuration_operation_signature::Data> for ConfigurationOperationSignature {
    fn from(signature: configuration_operation_signature::Data) -> Self {
        Self {
            owner_id: signature.owner_id.to_string(),
            signature: signature.signature.to_hex_string(),
            created_at: signature.created_at.to_rfc3339(),
        }
    }
}
