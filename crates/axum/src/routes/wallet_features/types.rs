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

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<wallet_features::Data> for WalletFeatures.
impl From<wallet_features::Data> for WalletFeatures {
    fn from(wallet_features: wallet_features::Data) -> Self {
        Self { is_enabled_ai: wallet_features.is_enabled_ai }
    }
}
