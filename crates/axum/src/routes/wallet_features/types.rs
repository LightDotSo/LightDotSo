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

use lightdotso_prisma::wallet_features;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// WalletFeatures root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletFeatures {
    /// The wallet_features of whether the testnet is enabled.
    pub is_enabled_ai: bool,
}

/// Optional WalletFeatures root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletFeaturesOptional {
    /// The update query of wallet_features of whether the testnet is enabled.
    pub is_enabled_ai: Option<bool>,
}

/// Implement From<wallet_features::Data> for WalletFeatures.
impl From<wallet_features::Data> for WalletFeatures {
    fn from(wallet_features: wallet_features::Data) -> Self {
        Self { is_enabled_ai: wallet_features.is_enabled_ai }
    }
}
