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

use crate::routes::notification_settings::types::{
    NotificationSettings, NotificationSettingsUpdate,
};
use lightdotso_prisma::wallet_notification_settings;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// WalletNotificationSettings root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletNotificationSettings {
    /// The id of wallet notification settings.
    pub id: String,
    /// The notification settings of wallet notification settings.
    pub settings: Vec<NotificationSettings>,
}

/// Optional WalletNotificationSettings root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletNotificationSettingsOptional {
    /// The update query of wallet notification settings of whether the testnet is enabled.
    pub settings: Option<Vec<NotificationSettingsUpdate>>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<wallet_notification_settings::Data> for WalletNotificationSettings.
impl From<wallet_notification_settings::Data> for WalletNotificationSettings {
    fn from(wallet_notification_settings: wallet_notification_settings::Data) -> Self {
        Self {
            id: wallet_notification_settings.id,
            settings: wallet_notification_settings
                .notification_settings
                .unwrap_or_default()
                .into_iter()
                .map(NotificationSettings::from)
                .collect(),
        }
    }
}
