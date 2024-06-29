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

use lightdotso_prisma::notification_settings;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// NotificationSettings root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationSettings {
    /// The id of the notification settings.
    id: String,
    /// The key of the notification settings.
    key: String,
    /// The flag that indicates if the notification settings is enabled.
    is_enabled: bool,
}

/// WalletNotificationSettingsUpdate root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationSettingsUpdate {
    /// The key of the notification settings.
    pub key: String,
    /// The boolean value of the notification settings.
    pub value: bool,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<notification_settings::Data> for NotificationSettings.
impl From<notification_settings::Data> for NotificationSettings {
    fn from(notification_settings: notification_settings::Data) -> Self {
        Self {
            id: notification_settings.id,
            key: notification_settings.key,
            is_enabled: notification_settings.is_enabled,
        }
    }
}
