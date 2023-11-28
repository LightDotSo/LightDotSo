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

use ethers::types::{Address, Bytes, Log, Transaction, TransactionReceipt, H256, U256};

// From: https://github.com/shunkakinoki/silius/blob/6a92f9414263754a74a193ce79b489db58cbbc43/crates/primitives/src/user_operation.rs#L32
// License: MIT

/// User operation receipt
#[derive(Clone, Debug)]
pub struct UserOperationWithTransactionAndReceiptLogs {
    /// The chain id of the chain this operation was sent to
    pub chain_id: i64,
    /// The hash of the user operation
    pub hash: H256,
    /// The entry point address this operation was sent to
    pub entry_point: Address,
    /// Sender of the user operation
    pub sender: Option<Address>,
    /// Nonce (anti replay protection)
    pub nonce: Option<U256>,
    /// Init code for the account (needed if account not yet deployed and needs to be created)
    pub init_code: Option<Bytes>,
    /// The data that is passed to the sender during the main execution call
    pub call_data: Option<Bytes>,
    /// The amount of gas to allocate for the main execution call
    pub call_gas_limit: Option<U256>,
    /// The amount of gas to allocate for the verification step
    pub verification_gas_limit: Option<U256>,
    /// The amount of gas to pay bundler to compensate for the pre-verification execution and
    /// calldata
    pub pre_verification_gas: Option<U256>,
    /// Maximum fee per gas (similar to EIP-1559)
    pub max_fee_per_gas: Option<U256>,
    /// Maximum priority fee per gas (similar to EIP-1559)
    pub max_priority_fee_per_gas: Option<U256>,
    /// Address of paymaster sponsoring the user operation, followed by extra data to send to the
    /// paymaster (can be empty)
    pub paymaster_and_data: Option<Bytes>,
    /// Data passed to the account along with the nonce during the verification step
    pub signature: Option<Bytes>,
    /// Logs emitted by this operation
    pub logs: Vec<Log>,
    /// The transaction that included this operation
    pub transaction: Transaction,
    /// Logs for the transaction that included this operation
    pub transaction_logs: Vec<Log>,
    /// The receipt of the transaction that included this operation
    pub receipt: TransactionReceipt,
    /// The wallet address of the sender
    pub light_wallet: Address,
}
