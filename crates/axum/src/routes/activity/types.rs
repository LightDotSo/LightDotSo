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

use crate::routes::user::types::User;
use lightdotso_prisma::activity;
use serde::{Deserialize, Serialize};
use serde_json::Value;
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
    /// The log message of the activity.
    log: Value,
    /// The wallet address of the activity.
    address: Option<String>,
    /// The user that created the activity.
    user: Option<User>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<activity::Data> for Activity.
impl From<activity::Data> for Activity {
    fn from(activity: activity::Data) -> Self {
        Self {
            id: activity.id,
            entity: activity.entity.to_string(),
            operation: activity.operation.to_string(),
            timestamp: activity.timestamp.to_rfc3339(),
            log: activity.log,
            address: activity.wallet_address.map(|addr| addr.to_string()),
            user: activity.user.and_then(|user| user.map(|data| User::from(*data))),
        }
    }
}
