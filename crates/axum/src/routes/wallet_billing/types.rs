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

use crate::routes::billing::types::Billing;
use lightdotso_prisma::wallet_billing;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// WalletBilling root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletBilling {
    /// The wallet billing of the balance in USD.
    pub id: String,
    /// The billing data of the wallet billing.
    pub billing: Option<Billing>,
}

/// Optional WalletBilling root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletBillingOptional {
    /// The update query of wallet_billing of whether the testnet is enabled.
    pub id: String,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<wallet_billing::Data> for WalletBilling.
impl From<wallet_billing::Data> for WalletBilling {
    fn from(wallet_billing: wallet_billing::Data) -> Self {
        Self {
            id: wallet_billing.id,
            billing: wallet_billing.billing.map(|billing| Billing::from(*billing)),
        }
    }
}
