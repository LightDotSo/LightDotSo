// Copyright 2023-2024 Light
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

use crate::routes::{
    asset_change::types::AssetChange, interpretation_action::types::InterpretationAction,
};
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
    actions: Vec<InterpretationAction>,
    /// The array of asset changes of the interpretation.
    asset_changes: Vec<AssetChange>,
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
                .map(InterpretationAction::from)
                .collect(),
            asset_changes: interpretation
                .asset_changes
                .unwrap_or_default()
                .into_iter()
                .map(AssetChange::from)
                .collect(),
        }
    }
}
