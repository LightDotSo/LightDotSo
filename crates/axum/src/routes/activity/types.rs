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

use lightdotso_prisma::activity;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Activity root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Activity {
    /// The id of the activity.
    id: String,
    /// The entity id of the activity.
    entity: String,
    /// The operation type of the activity.
    operation: String,
    /// The timestamp of the activity.
    timestamp: String,
    /// The actor wallet address of the activity.
    address: Option<String>,
}

/// Implement From<activity::Data> for Activity.
impl From<activity::Data> for Activity {
    fn from(activity: activity::Data) -> Self {
        Self {
            id: activity.id,
            entity: activity.entity.to_string(),
            operation: activity.operation.to_string(),
            timestamp: activity.timestamp.to_rfc3339(),
            address: activity.wallet_address.map(|addr| addr.to_string()),
        }
    }
}
