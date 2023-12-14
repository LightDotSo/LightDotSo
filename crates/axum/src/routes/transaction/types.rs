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

use lightdotso_prisma::transaction;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Transaction root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Transaction {
    /// The chain id of the transaction.
    chain_id: i64,
    /// The hash of the transaction.
    hash: String,
    /// The timestamp of the transaction.
    timestamp: String,
}

/// Implement From<transaction::Data> for Transaction.
impl From<transaction::Data> for Transaction {
    fn from(transaction: transaction::Data) -> Self {
        Self {
            chain_id: transaction.chain_id,
            hash: transaction.hash,
            timestamp: transaction.timestamp.to_rfc3339(),
        }
    }
}
