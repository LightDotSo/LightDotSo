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

use lightdotso_prisma::support_request;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Support Request root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct SupportRequest {
    /// The title of the support_request.
    pub title: String,
    /// The description of the support_request.
    pub description: String,
    /// The area of the support_request.
    pub area: String,
    /// The severity of the support_request.
    pub severity: i32,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<support_request::Data> for Support_request.
impl From<support_request::Data> for SupportRequest {
    fn from(support_request: support_request::Data) -> Self {
        Self {
            title: support_request.title,
            description: support_request.description,
            area: support_request.area,
            severity: support_request.severity,
        }
    }
}
