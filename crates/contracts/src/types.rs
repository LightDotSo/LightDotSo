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

#![allow(clippy::unwrap_used)]

use crate::entrypoint::EntryPoint::UserOperation as EntryPointUserOperation;
use alloy::{
    primitives::{Address, Bytes, B256, U256},
    rpc::types::{Log, Transaction, TransactionReceipt},
};
use lightdotso_prisma::user_operation;
use serde::{Deserialize, Serialize};

// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

// From: https://github.com/shunkakinoki/silius/blob/6a92f9414263754a74a193ce79b489db58cbbc43/crates/primitives/src/user_operation.rs#L32
// License: MIT

/// User operation receipt
#[derive(Clone, Debug)]
pub struct UserOperationWithTransactionAndReceiptLogs {
    /// The chain id of the chain this operation was sent to
    pub chain_id: i64,
    /// The hash of the user operation
    pub hash: B256,
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
    /// The address of the paymaster sponsoring this operation
    pub paymaster: Option<Address>,
    /// Flag to indicate whether it's reverted
    pub is_reverted: bool,
}

/// Thee paymaster and data returned by the paymaster.
/// This is a separate struct to allow for easy serialization and deserialization.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymasterAndData {
    pub paymaster_and_data: Bytes,
}

/// The gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GasAndPaymasterAndData {
    #[serde(rename = "callGasLimit")]
    pub call_gas_limit: U256,
    #[serde(rename = "verificationGasLimit")]
    pub verification_gas_limit: U256,
    #[serde(rename = "preVerificationGas")]
    pub pre_verification_gas: U256,
    #[serde(rename = "paymasterAndData")]
    pub paymaster_and_data: Bytes,
}

/// The biconomy gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BiconomyGasAndPaymasterAndData {
    #[serde(rename = "callGasLimit")]
    pub call_gas_limit: U256,
    #[serde(rename = "verificationGasLimit")]
    pub verification_gas_limit: U256,
    #[serde(rename = "preVerificationGas")]
    pub pre_verification_gas: U256,
    #[serde(rename = "paymasterAndData")]
    pub paymaster_and_data: Bytes,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mode: Option<String>,
}

// From: https://github.com/alloy-rs/alloy/blob/599e57751fd986a4b3fb64935e80cc512b87a018/crates/rpc-types-eth/src/erc4337.rs#L48-L76
// License: MIT
/// [`UserOperation`] in the spec: Entry Point V0.6
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperation {
    /// The address of the smart contract account
    pub sender: Address,
    /// Anti-replay protection; also used as the salt for first-time account creation
    pub nonce: U256,
    /// Code used to deploy the account if not yet on-chain
    pub init_code: Bytes,
    /// Data that's passed to the sender for execution
    pub call_data: Bytes,
    /// Gas limit for execution phase
    pub call_gas_limit: U256,
    /// Gas limit for verification phase
    pub verification_gas_limit: U256,
    /// Gas to compensate the bundler
    pub pre_verification_gas: U256,
    /// Maximum fee per gas
    pub max_fee_per_gas: U256,
    /// Maximum priority fee per gas
    pub max_priority_fee_per_gas: U256,
    /// Paymaster Contract address and any extra data required for verification and execution
    /// (empty for self-sponsored transaction)
    pub paymaster_and_data: Bytes,
    /// Used to validate a UserOperation along with the nonce during verification
    pub signature: Bytes,
}

// -----------------------------------------------------------------------------
// Implementations
// -----------------------------------------------------------------------------

impl From<UserOperation> for EntryPointUserOperation {
    fn from(user_operation: UserOperation) -> Self {
        Self {
            sender: user_operation.sender,
            nonce: user_operation.nonce,
            initCode: user_operation.init_code,
            callData: user_operation.call_data,
            callGasLimit: user_operation.call_gas_limit,
            verificationGasLimit: user_operation.verification_gas_limit,
            preVerificationGas: user_operation.pre_verification_gas,
            maxFeePerGas: user_operation.max_fee_per_gas,
            maxPriorityFeePerGas: user_operation.max_priority_fee_per_gas,
            paymasterAndData: user_operation.paymaster_and_data,
            signature: user_operation.signature,
        }
    }
}

impl From<user_operation::Data> for UserOperation {
    fn from(user_operation: user_operation::Data) -> Self {
        Self {
            sender: user_operation.sender.parse().unwrap(),
            nonce: U256::from(user_operation.nonce),
            init_code: user_operation.init_code.into(),
            call_data: user_operation.call_data.into(),
            call_gas_limit: U256::from(user_operation.call_gas_limit),
            verification_gas_limit: U256::from(user_operation.verification_gas_limit),
            pre_verification_gas: U256::from(user_operation.pre_verification_gas),
            max_fee_per_gas: U256::from(user_operation.max_fee_per_gas),
            max_priority_fee_per_gas: U256::from(user_operation.max_priority_fee_per_gas),
            paymaster_and_data: user_operation.paymaster_and_data.into(),
            signature: user_operation.signature.unwrap_or_default().into(),
        }
    }
}

// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

// From: https://github.com/alloy-rs/alloy/blob/599e57751fd986a4b3fb64935e80cc512b87a018/crates/rpc-types-eth/src/erc4337.rs#L78C1-L124C2
// License: MIT
/// [`PackedUserOperation`] in the spec: Entry Point V0.7
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackedUserOperation {
    /// The account making the operation.
    pub sender: Address,
    /// Prevents message replay attacks and serves as a randomizing element for initial user
    /// registration.
    pub nonce: U256,
    /// Deployer contract address: Required exclusively for deploying new accounts that don't yet
    /// exist on the blockchain.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub factory: Option<Address>,
    /// Factory data for the account creation process, applicable only when using a deployer
    /// contract.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub factory_data: Option<Bytes>,
    /// The call data.
    pub call_data: Bytes,
    /// The gas limit for the call.
    pub call_gas_limit: U256,
    /// The gas limit for the verification.
    pub verification_gas_limit: U256,
    /// Prepaid gas fee: Covers the bundler's costs for initial transaction validation and data
    /// transmission.
    pub pre_verification_gas: U256,
    /// The maximum fee per gas.
    pub max_fee_per_gas: U256,
    /// The maximum priority fee per gas.
    pub max_priority_fee_per_gas: U256,
    /// Paymaster contract address: Needed if a third party is covering transaction costs; left
    /// blank for self-funded accounts.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub paymaster: Option<Address>,
    /// The gas limit for the paymaster verification.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub paymaster_verification_gas_limit: Option<U256>,
    /// The gas limit for the paymaster post-operation.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub paymaster_post_op_gas_limit: Option<U256>,
    /// The paymaster data.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub paymaster_data: Option<Bytes>,
    /// The signature of the transaction.
    pub signature: Bytes,
}

// -----------------------------------------------------------------------------
// Implementations
// -----------------------------------------------------------------------------

impl From<UserOperation> for PackedUserOperation {
    fn from(user_op: UserOperation) -> Self {
        // Pack call_gas_limit and verification_gas_limit into a single U256
        let _account_gas_limits =
            U256::from(user_op.verification_gas_limit) << 128 | U256::from(user_op.call_gas_limit);

        // Pack max_priority_fee_per_gas and max_fee_per_gas into a single U256
        let _gas_fees = U256::from(user_op.max_priority_fee_per_gas) << 128 |
            U256::from(user_op.max_fee_per_gas);

        // Extract paymaster information from paymaster_and_data
        let (
            paymaster,
            paymaster_verification_gas_limit,
            paymaster_post_op_gas_limit,
            paymaster_data,
        ) = if user_op.paymaster_and_data.len() >= 52 {
            (
                Some(Address::from_slice(&user_op.paymaster_and_data[..20])),
                Some(U256::from_be_slice(&user_op.paymaster_and_data[20..36])),
                Some(U256::from_be_slice(&user_op.paymaster_and_data[36..52])),
                Some(Bytes::copy_from_slice(&user_op.paymaster_and_data[52..])),
            )
        } else {
            (None, None, None, None)
        };

        PackedUserOperation {
            sender: user_op.sender,
            nonce: user_op.nonce,
            factory: if user_op.init_code.is_empty() {
                None
            } else {
                Some(Address::from_slice(&user_op.init_code[..20]))
            },
            factory_data: if user_op.init_code.len() > 20 {
                Some(Bytes::copy_from_slice(&user_op.init_code[20..]))
            } else {
                None
            },
            call_data: user_op.call_data,
            call_gas_limit: user_op.call_gas_limit,
            verification_gas_limit: user_op.verification_gas_limit,
            max_fee_per_gas: user_op.max_fee_per_gas,
            max_priority_fee_per_gas: user_op.max_priority_fee_per_gas,
            pre_verification_gas: user_op.pre_verification_gas,
            paymaster,
            paymaster_verification_gas_limit,
            paymaster_post_op_gas_limit,
            paymaster_data,
            signature: user_op.signature,
        }
    }
}

// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

/// User operation required for the request.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperationRequest {
    pub sender: Address,
    pub nonce: U256,
    pub init_code: Bytes,
    pub call_data: Bytes,
    pub call_gas_limit: Option<U256>,
    pub verification_gas_limit: Option<U256>,
    pub pre_verification_gas: Option<U256>,
    pub max_fee_per_gas: Option<U256>,
    pub max_priority_fee_per_gas: Option<U256>,
    pub paymaster_and_data: Option<Bytes>,
    pub signature: Bytes,
}

/// Packed user operation required for the request.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackedUserOperationRequest {
    pub sender: Address,
    pub nonce: U256,
    pub factory: Option<Address>,
    pub factory_data: Option<Bytes>,
    pub call_data: Bytes,
    pub call_gas_limit: Option<U256>,
    pub verification_gas_limit: Option<U256>,
    pub pre_verification_gas: Option<U256>,
    pub max_fee_per_gas: Option<U256>,
    pub max_priority_fee_per_gas: Option<U256>,
    pub paymaster: Option<Address>,
    pub paymaster_verification_gas_limit: Option<U256>,
    pub paymaster_post_op_gas_limit: Option<U256>,
    pub paymaster_data: Option<Bytes>,
    pub signature: Bytes,
}

/// User operation request variant
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum UserOperationRequestVariant {
    Default(UserOperationRequest),
    Packed(PackedUserOperationRequest),
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/types.rs#L27
/// License: MIT
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EstimateResult {
    pub pre_verification_gas: U256,
    pub verification_gas_limit: U256,
    pub call_gas_limit: U256,
}

// From: https://github.com/silius-rs/silius/blob/f695b54cbbabf6b3f22f7af8918a2d6d83ca8960/crates/primitives/src/user_operation/mod.rs#L423-L441
// License: Apache-2.0

/// Receipt of the user operation (returned from the RPC endpoint eth_getUserOperationReceipt)
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperationReceipt {
    #[serde(rename = "userOpHash")]
    pub user_operation_hash: B256,
    pub sender: Address,
    pub nonce: U256,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub paymaster: Option<Address>,
    pub actual_gas_cost: U256,
    pub actual_gas_used: U256,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    pub logs: Vec<Log>,
    #[serde(rename = "receipt")]
    pub tx_receipt: TransactionReceipt,
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_u256_to_string() {
        let number = U256::from(12345);
        let result = format!("{}", number);
        assert_eq!(result, "12345");
    }

    #[test]
    fn test_u256_to_string_zero() {
        let number = U256::from(0);
        let result = format!("{}", number);
        assert_eq!(result, "0");
    }

    #[test]
    fn test_u256_to_string_large_number() {
        let number = U256::from(1_000_000_000_000_000_000_000_000_u128);
        let result = format!("{}", number);
        assert_eq!(result, "1000000000000000000000000");
    }
}
