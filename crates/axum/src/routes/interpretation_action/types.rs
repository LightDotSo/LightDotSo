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
