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

use crate::routes::interpretation::types::Interpretation;
use lightdotso_prisma::transaction;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Transaction root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Transaction {
    /// The chain id of the transaction.
    chain_id: i64,
    /// The hash of the transaction.
    hash: String,
    /// The timestamp of the transaction.
    timestamp: String,
    /// The interpretation of the transaction.
    interpretation: Option<Interpretation>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<transaction::Data> for Transaction.
impl From<transaction::Data> for Transaction {
    fn from(transaction: transaction::Data) -> Self {
        Self {
            chain_id: transaction.chain_id,
            hash: transaction.hash,
            timestamp: transaction.timestamp.to_rfc3339(),
            interpretation: transaction.interpretation.and_then(|maybe_interpretation| {
                maybe_interpretation.map(|interpretation| Interpretation::from(*interpretation))
            }),
        }
    }
}
