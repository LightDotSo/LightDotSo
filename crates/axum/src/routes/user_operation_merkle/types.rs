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

use crate::routes::{
    user_operation::types::UserOperation,
    user_operation_merkle_proof::types::UserOperationMerkleProof,
};
use lightdotso_prisma::user_operation_merkle;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// UserOperationMerkle root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationMerkle {
    /// The root of the merkle tree.
    root: String,
    /// The user operations in the merkle tree.
    #[schema(no_recursion)]
    user_operations: Vec<UserOperation>,
    /// The proofs of the merkle tree.
    #[schema(no_recursion)]
    proofs: Vec<UserOperationMerkleProof>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<user_operation_merkle::Data> for UserOperationMerkle.
impl From<user_operation_merkle::Data> for UserOperationMerkle {
    fn from(user_operation_merkle: user_operation_merkle::Data) -> Self {
        Self {
            root: user_operation_merkle.root,
            user_operations: user_operation_merkle
                .user_operations
                .unwrap_or_default()
                .into_iter()
                .map(UserOperation::from)
                .collect(),
            proofs: user_operation_merkle
                .user_operation_merkle_proofs
                .unwrap_or_default()
                .into_iter()
                .map(UserOperationMerkleProof::from)
                .collect(),
        }
    }
}
