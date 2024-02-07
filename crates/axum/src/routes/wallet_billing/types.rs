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
