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
    interpretation::types::Interpretation, paymaster::types::Paymaster,
    paymaster_operation::types::PaymasterOperation, signature::types::Signature,
    transaction::types::Transaction,
};
use lightdotso_common::traits::VecU8ToHex;
use lightdotso_prisma::user_operation;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// User operation create.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationCreate {
    chain_id: i64,
    hash: String,
    sender: String,
    nonce: i64,
    init_code: String,
    call_data: String,
    call_gas_limit: i64,
    verification_gas_limit: i64,
    pre_verification_gas: i64,
    max_fee_per_gas: i64,
    max_priority_fee_per_gas: i64,
    paymaster_and_data: String,
}

/// User operation transaction
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationTransaction {
    /// The hash of the transaction.
    pub hash: String,
}

/// User operation operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum UserOperationSuccess {
    /// User operation updated successfully.
    #[schema(example = "Update Success")]
    Updated(String),
}

/// User operation root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperation {
    /// The chain id of the user operation.
    pub chain_id: i64,
    /// The hash of the user operation.
    pub hash: String,
    /// The sender of the user operation.
    pub sender: String,
    /// The nonce of the user operation.
    pub nonce: i64,
    /// The init code of the user operation.
    pub init_code: String,
    /// The call data of the user operation.
    pub call_data: String,
    /// The call gas of the user operation.
    pub call_gas_limit: i64,
    /// The verification gas of the user operation.
    pub verification_gas_limit: i64,
    /// The pre verification gas of the user operation.
    pub pre_verification_gas: i64,
    /// The maximum fee per gas of the user operation.
    pub max_fee_per_gas: i64,
    /// The maximum priority fee per gas of the user operation.
    pub max_priority_fee_per_gas: i64,
    /// The paymaster and data of the user operation.
    pub paymaster_and_data: String,
    /// The status of the user operation.
    pub status: String,
    /// The paymaster of the user operation.
    pub paymaster: Option<Paymaster>,
    /// The paymaster operation of the user operation.
    pub paymaster_operation: Option<PaymasterOperation>,
    /// The signatures of the user operation.
    pub signatures: Vec<Signature>,
    /// The transaction of the user operation.
    pub transaction: Option<Transaction>,
    /// The interpretation of the transaction.
    pub interpretation: Option<Interpretation>,
    /// The timestamp of the user operation.
    pub created_at: String,
    /// The timestamp updated of the user operation.
    pub updated_at: String,
}

/// Implement From<user_operation::Data> for User operation.
impl From<user_operation::Data> for UserOperation {
    fn from(user_operation: user_operation::Data) -> Self {
        Self {
            chain_id: user_operation.chain_id,
            hash: user_operation.hash,
            sender: user_operation.sender,
            nonce: user_operation.nonce,
            init_code: user_operation.init_code.to_hex_string(),
            call_data: user_operation.call_data.to_hex_string(),
            call_gas_limit: user_operation.call_gas_limit,
            verification_gas_limit: user_operation.verification_gas_limit,
            pre_verification_gas: user_operation.pre_verification_gas,
            max_fee_per_gas: user_operation.max_fee_per_gas,
            max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas,
            paymaster_and_data: user_operation.paymaster_and_data.to_hex_string(),
            status: user_operation.status.to_string(),
            paymaster: user_operation
                .paymaster
                .and_then(|paymaster| paymaster.map(|data| Paymaster::from(*data))),
            paymaster_operation: user_operation.paymaster_operation.and_then(
                |paymaster_operation| {
                    paymaster_operation.map(|data| PaymasterOperation::from(*data))
                },
            ),
            signatures: user_operation.signatures.map_or(Vec::new(), |signature| {
                signature.into_iter().map(|sig| sig.into()).collect()
            }),
            transaction: user_operation
                .transaction
                .and_then(|transaction| transaction.map(|data| Transaction::from(*data))),
            interpretation: user_operation
                .interpretation
                .and_then(|interpretation| interpretation.map(|data| Interpretation::from(*data))),
            created_at: user_operation.created_at.to_rfc3339(),
            updated_at: user_operation.updated_at.to_rfc3339(),
        }
    }
}
