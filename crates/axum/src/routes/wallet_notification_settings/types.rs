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
