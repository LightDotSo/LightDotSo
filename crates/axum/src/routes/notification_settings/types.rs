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
