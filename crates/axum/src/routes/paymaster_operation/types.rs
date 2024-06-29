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

use crate::routes::billing_operation::types::BillingOperation;
use lightdotso_prisma::paymaster_operation;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// PaymasterOperation root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct PaymasterOperation {
    /// The id of the paymaster operation.
    id: String,
    /// The billing operation of the operation.
    billing_operation: Option<BillingOperation>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<paymaster_operation::Data> for PaymasterOperation.
impl From<paymaster_operation::Data> for PaymasterOperation {
    fn from(paymaster_operation: paymaster_operation::Data) -> Self {
        Self {
            id: paymaster_operation.id,
            billing_operation: paymaster_operation.billing_operation.and_then(
                |maybe_billing_operation| {
                    maybe_billing_operation
                        .map(|interpretation| BillingOperation::from(*interpretation))
                },
            ),
        }
    }
}
