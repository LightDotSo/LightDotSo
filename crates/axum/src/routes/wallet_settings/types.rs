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

use lightdotso_prisma::wallet_settings;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// WalletSettings root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletSettings {
    /// The wallet_settings of whether the developer mode is enabled.
    pub is_enabled_dev: bool,
    /// The wallet_settings of whether the testnet is enabled.
    pub is_enabled_testnet: bool,
}

/// Optional WalletSettings root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletSettingsOptional {
    /// The update query of wallet_settings of whether the developer mode is enabled.
    pub is_enabled_dev: Option<bool>,
    /// The update query of wallet_settings of whether the testnet is enabled.
    pub is_enabled_testnet: Option<bool>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<wallet_settings::Data> for WalletSettings.
impl From<wallet_settings::Data> for WalletSettings {
    fn from(wallet_settings: wallet_settings::Data) -> Self {
        Self {
            is_enabled_dev: wallet_settings.is_enabled_dev,
            is_enabled_testnet: wallet_settings.is_enabled_testnet,
        }
    }
}
