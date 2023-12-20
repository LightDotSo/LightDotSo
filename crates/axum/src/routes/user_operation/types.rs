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

use lightdotso_common::traits::VecU8ToHex;
use lightdotso_prisma::{owner, paymaster, signature, transaction, user_operation};
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

/// User operation paymaster
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationPaymaster {
    /// The address of the paymaster.
    address: String,
}

/// User operation owner
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationOwner {
    /// The id of the owner.
    pub id: String,
    /// The address of the owner.
    pub address: String,
    /// The weight of the owner.
    pub weight: i64,
}

/// User operation signature
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct UserOperationSignature {
    /// The id of the owner of the signature.
    pub owner_id: String,
    /// The signature in hex string.
    pub signature: String,
    /// The signature type
    pub signature_type: i32,
    /// The created time of the signature.
    pub created_at: String,
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
    status: String,
    paymaster: Option<UserOperationPaymaster>,
    signatures: Vec<UserOperationSignature>,
    transaction: Option<UserOperationTransaction>,
    created_at: String,
    updated_at: String,
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
                .and_then(|paymaster| paymaster.map(|data| UserOperationPaymaster::from(*data))),
            signatures: user_operation.signatures.map_or(Vec::new(), |signature| {
                signature.into_iter().map(UserOperationSignature::from).collect()
            }),
            transaction: user_operation.transaction.and_then(|transaction| {
                transaction.map(|data| UserOperationTransaction::from(*data))
            }),
            created_at: user_operation.created_at.to_rfc3339(),
            updated_at: user_operation.updated_at.to_rfc3339(),
        }
    }
}

/// Implement From<owner::Data> for Owner.
impl From<owner::Data> for UserOperationOwner {
    fn from(owner: owner::Data) -> Self {
        Self { id: owner.id.to_string(), address: owner.address.to_string(), weight: owner.weight }
    }
}

/// Implement From<paymaster::Data> for Paymaster.
impl From<paymaster::Data> for UserOperationPaymaster {
    fn from(paymaster: paymaster::Data) -> Self {
        Self { address: paymaster.address }
    }
}

/// Implement From<signature::Data> for Owner.
impl From<signature::Data> for UserOperationSignature {
    fn from(signature: signature::Data) -> Self {
        Self {
            owner_id: signature.owner_id.to_string(),
            signature: signature.signature.to_hex_string(),
            signature_type: signature.signature_type,
            created_at: signature.created_at.to_rfc3339(),
        }
    }
}

/// Implement From<transaction::Data> for Owner.
impl From<transaction::Data> for UserOperationTransaction {
    fn from(transaction: transaction::Data) -> Self {
        Self { hash: transaction.hash }
    }
}
