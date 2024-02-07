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

use eyre::{eyre, Result};
use lightdotso_prisma::{
    notification_settings, NotificationSettingsEntity, NotificationSettingsOperation,
    NotificationSettingsPlatform,
};
use serde::{Deserialize, Serialize};
use serde_json::from_str;
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
    /// The entity of the notification settings.
    entity: String,
    /// The operation of the notification settings.
    operation: String,
    /// The platform of the notification settings.
    platform: String,
    /// The flag that indicates if the notification settings is enabled.
    is_enabled: bool,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<notification_settings::Data> for NotificationSettings.
impl From<notification_settings::Data> for NotificationSettings {
    fn from(notification_settings: notification_settings::Data) -> Self {
        Self {
            id: notification_settings.id,
            entity: notification_settings.entity.to_string(),
            operation: notification_settings.operation.to_string(),
            platform: notification_settings.platform.to_string(),
            is_enabled: notification_settings.is_enabled,
        }
    }
}

// -----------------------------------------------------------------------------
// Try From
// -----------------------------------------------------------------------------

/// Implement TryFrom<NotificationSettings> for (NotificationSettingsEntity,
/// NotificationSettingsOperation, NotificationSettingsPlatform).
impl TryFrom<NotificationSettings>
    for (NotificationSettingsEntity, NotificationSettingsOperation, NotificationSettingsPlatform)
{
    type Error = eyre::Report;

    fn try_from(notification_settings: NotificationSettings) -> Result<Self, Self::Error> {
        let entity: NotificationSettingsEntity =
            from_str(&format!("\"{}\"", notification_settings.entity))
                .map_err(|_| eyre!("Invalid entity"))?;
        let operation: NotificationSettingsOperation =
            from_str(&format!("\"{}\"", notification_settings.operation))
                .map_err(|_| eyre!("Invalid operation"))?;
        let platform: NotificationSettingsPlatform =
            from_str(&format!("\"{}\"", notification_settings.platform))
                .map_err(|_| eyre!("Invalid platform"))?;

        Ok((entity, operation, platform))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversion() -> Result<()> {
        let settings = NotificationSettings {
            id: "asdf".to_string(),
            is_enabled: false,
            entity: "INVITE_CODE".to_string(),
            operation: "UPDATE".to_string(),
            platform: "WEB".to_string(),
        };

        let (entity, operation, platform): (
            NotificationSettingsEntity,
            NotificationSettingsOperation,
            NotificationSettingsPlatform,
        ) = <(
            NotificationSettingsEntity,
            NotificationSettingsOperation,
            NotificationSettingsPlatform,
        )>::try_from(settings)?;

        assert_eq!(entity, NotificationSettingsEntity::InviteCode);
        assert_eq!(operation, NotificationSettingsOperation::Update);
        assert_eq!(platform, NotificationSettingsPlatform::Web);

        Ok(())
    }
}
