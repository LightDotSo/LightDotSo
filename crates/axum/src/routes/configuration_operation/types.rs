// Copyright 2023-2024 Light, Inc.
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

use lightdotso_prisma::configuration_operation;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// ConfigurationOperation root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct ConfigurationOperation {
    /// The image hash of the configuration operation.
    pub image_hash: String,
    /// The checkpoint of the configuration operation.
    pub checkpoint: i64,
    /// The threshold of the configuration operation.
    pub threshold: i64,
    /// The status of the configuration operation.
    pub status: String,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<configuration_operation::Data> for ConfigurationOperation.
impl From<configuration_operation::Data> for ConfigurationOperation {
    fn from(configuration_operation: configuration_operation::Data) -> Self {
        Self {
            image_hash: configuration_operation.image_hash,
            checkpoint: configuration_operation.checkpoint,
            threshold: configuration_operation.threshold,
            status: configuration_operation.status.to_string(),
        }
    }
}
