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
