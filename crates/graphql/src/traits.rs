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

use crate::polling::user_operations::UserOperation;
use ethers::types::{
    Address, Bloom, Bytes, Log, OtherFields, Transaction, TransactionReceipt, H256, U256,
};
use lightdotso_common::traits::HexToBytes;

// From: https://github.com/shunkakinoki/silius/blob/6a92f9414263754a74a193ce79b489db58cbbc43/crates/primitives/src/user_operation.rs#L32
// License: MIT

/// User operation receipt
pub struct UserOperationWithTransactionAndReceiptLogs {
    /// The chain id of the chain this operation was sent to
    pub chain_id: i64,
    /// The hash of the user operation
    pub hash: H256,
    /// The entry point address this operation was sent to
    pub entry_point: Address,
    /// Sender of the user operation
    pub sender: Address,
    /// Nonce (anti replay protection)
    pub nonce: U256,
    /// Init code for the account (needed if account not yet deployed and needs to be created)
    pub init_code: Bytes,
    /// The data that is passed to the sender during the main execution call
    pub call_data: Bytes,
    /// The amount of gas to allocate for the main execution call
    pub call_gas_limit: U256,
    /// The amount of gas to allocate for the verification step
    pub verification_gas_limit: U256,
    /// The amount of gas to pay bundler to compensate for the pre-verification execution and
    /// calldata
    pub pre_verification_gas: U256,
    /// Maximum fee per gas (similar to EIP-1559)
    pub max_fee_per_gas: U256,
    /// Maximum priority fee per gas (similar to EIP-1559)
    pub max_priority_fee_per_gas: U256,
    /// Address of paymaster sponsoring the user operation, followed by extra data to send to the
    /// paymaster (can be empty)
    pub paymaster_and_data: Bytes,
    /// Data passed to the account along with the nonce during the verification step
    pub signature: Bytes,
    /// Logs emitted by this operation
    pub logs: Vec<Log>,
    /// The transaction that included this operation
    pub transaction: Transaction,
    /// Logs for the transaction that included this operation
    pub transaction_logs: Vec<Log>,
    /// The receipt of the transaction that included this operation
    pub receipt: TransactionReceipt,
}

pub struct UserOperationConstruct {
    pub user_operation: UserOperation,
    pub chain_id: i64,
}

// Implement From<UserOperationConstruct> for User operation.
impl From<UserOperationConstruct> for UserOperationWithTransactionAndReceiptLogs {
    fn from(op: UserOperationConstruct) -> Self {
        Self {
            chain_id: op.chain_id,
            hash: op.user_operation.id.0.parse().unwrap(),
            entry_point: op.user_operation.entry_point.0.parse().unwrap(),
            sender: op.user_operation.sender.0.parse().unwrap(),
            nonce: op.user_operation.nonce.0.parse().unwrap(),
            init_code: op.user_operation.init_code.clone().0.hex_to_bytes().unwrap().into(),
            call_data: op.user_operation.call_data.clone().0.hex_to_bytes().unwrap().into(),
            call_gas_limit: op.user_operation.call_gas_limit.0.parse().unwrap(),
            verification_gas_limit: op.user_operation.verification_gas_limit.0.parse().unwrap(),
            pre_verification_gas: op.user_operation.pre_verification_gas.0.parse().unwrap(),
            max_fee_per_gas: op.user_operation.max_fee_per_gas.0.parse().unwrap(),
            max_priority_fee_per_gas: op.user_operation.max_priority_fee_per_gas.0.parse().unwrap(),
            paymaster_and_data: op
                .user_operation
                .paymaster_and_data
                .clone()
                .0
                .hex_to_bytes()
                .unwrap()
                .into(),
            signature: op.user_operation.signature.clone().0.hex_to_bytes().unwrap().into(),
            logs: vec![],
            transaction: Transaction {
                hash: op.user_operation.transaction.hash.unwrap().0.parse().unwrap(),
                // Determistic Option Zero
                nonce: 0.into(),
                // Determistic Option None
                block_hash: None,
                // Determistic Option None
                block_number: None,
                // Determistic Option None
                transaction_index: None,
                from: op.user_operation.transaction.from.0.parse().unwrap(),
                to: Some(op.user_operation.transaction.to.unwrap().0.parse().unwrap()),
                // Determistic Option Zero
                value: 0.into(),
                // Determistic Option None
                gas_price: None,
                // Determistic Option Zero
                gas: 0.into(),
                input: op
                    .user_operation
                    .transaction
                    .input
                    .unwrap()
                    .0
                    .hex_to_bytes()
                    .unwrap()
                    .into(),
                // Determistic Option Zero
                v: 0.into(),
                // Determistic Option Zero
                r: 0.into(),
                // Determistic Option Zero
                s: 0.into(),
                // Determistic Option None
                transaction_type: None,
                // Determistic Option None
                access_list: None,
                // Determistic Option None
                max_priority_fee_per_gas: None,
                // Determistic Option None
                max_fee_per_gas: None,
                chain_id: Some(op.chain_id.into()),
                // Determistic Option Default
                other: OtherFields::default(),
            },
            transaction_logs: vec![],
            receipt: TransactionReceipt {
                transaction_hash: op
                    .user_operation
                    .transaction
                    .receipt
                    .unwrap()
                    .id
                    .0
                    .parse()
                    .unwrap(),
                transaction_index: op.user_operation.transaction.index.unwrap().0.parse().unwrap(),
                // Determistic Option None
                block_hash: None,
                // Determistic Option None
                block_number: None,
                // Determistic Option Zero
                cumulative_gas_used: 0.into(),
                // Determistic Option None
                gas_used: None,
                // Determistic Option None
                contract_address: None,
                logs: vec![],
                // Determistic Option None
                status: None,
                // Determistic Option Default
                logs_bloom: Bloom::default(),
                // Determistic Option None
                root: None,
                from: op.user_operation.transaction.from.0.parse().unwrap(),
                // Determistic Option None
                to: None,
                // Determistic Option None
                transaction_type: None,
                // Determistic Option None
                effective_gas_price: None,
                // Determistic Option Default
                other: OtherFields::default(),
            },
        }
    }
}
