// Copyright 2023-2024 Light.
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

use lightdotso_prisma::configuration_operation_owner;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Owner root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct ConfigurationOperationOwner {
    /// The id of the owner.
    pub id: String,
    /// The address of the owner.
    pub address: String,
    /// The weight of the owner.
    pub weight: i64,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<configuration_operation_owner::Data> for Owner.
impl From<configuration_operation_owner::Data> for ConfigurationOperationOwner {
    fn from(owner: configuration_operation_owner::Data) -> Self {
        Self { id: owner.id.to_string(), address: owner.address.to_string(), weight: owner.weight }
    }
}
