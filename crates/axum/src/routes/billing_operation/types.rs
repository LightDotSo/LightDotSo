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

use lightdotso_prisma::billing_operation;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// BillingOperation root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct BillingOperation {
    /// The id of the billing operation.
    id: String,
    /// The status of the billing operation.
    status: String,
    /// The balance USD of the billing operation.
    balance_usd: f64,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<billing_operation::Data> for BillingOperation.
impl From<billing_operation::Data> for BillingOperation {
    fn from(billing_operation: billing_operation::Data) -> Self {
        Self {
            id: billing_operation.id,
            status: billing_operation.status.to_string(),
            balance_usd: billing_operation.balance_usd,
        }
    }
}
