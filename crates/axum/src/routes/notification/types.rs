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

use crate::routes::activity::types::Activity;
use lightdotso_prisma::notification;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Notification root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Notification {
    /// The id of the notification to read for.
    id: String,
    /// The activity of the notification.
    activity: Option<Activity>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<notification::Data> for Notification.
impl From<notification::Data> for Notification {
    fn from(notification: notification::Data) -> Self {
        Self {
            id: notification.id,
            activity: notification.activity.and_then(|maybe_activity| {
                maybe_activity.map(|activity| Activity::from(*activity))
            }),
        }
    }
}
