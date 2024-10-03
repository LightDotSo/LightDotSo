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
    /// The paymaster and data returned by the paymaster.
    pub paymaster_and_data: Bytes,
}

/// The gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GasAndPaymasterAndData {
    /// The call gas limit.
    #[serde(rename = "callGasLimit")]
    pub call_gas_limit: U256,
    /// The verification gas limit.
    #[serde(rename = "verificationGasLimit")]
    pub verification_gas_limit: U256,
    /// The pre verification gas.
    #[serde(rename = "preVerificationGas")]
    pub pre_verification_gas: U256,
    /// The paymaster and data returned by the paymaster.
    #[serde(rename = "paymasterAndData")]
    pub paymaster_and_data: Bytes,
}

/// The gas and paymaster and data returned by the paymaster for v0.7.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackedGasAndPaymasterAndData {
    /// The call gas limit.
    #[serde(rename = "callGasLimit")]
    pub call_gas_limit: U256,
    /// The verification gas limit.
    #[serde(rename = "verificationGasLimit")]
    pub verification_gas_limit: U256,
    /// The pre verification gas.
    #[serde(rename = "preVerificationGas")]
    pub pre_verification_gas: U256,
    /// The paymaster address returned by the paymaster.
    #[serde(rename = "paymaster")]
    pub paymaster: Address,
    /// The paymaster verification gas limit.
    #[serde(rename = "paymasterVerificationGasLimit")]
    pub paymaster_verification_gas_limit: U256,
    /// The paymaster post operation gas limit.
    #[serde(rename = "paymasterPostOpGasLimit")]
    pub paymaster_post_op_gas_limit: U256,
    /// The paymaster data.
    #[serde(rename = "paymasterData")]
    pub paymaster_data: Bytes,
}

/// The gas and paymaster and data variant
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum GasAndPaymasterAndDataVariant {
    Default(GasAndPaymasterAndData),
    Packed(PackedGasAndPaymasterAndData),
}

// -----------------------------------------------------------------------------
// Implementations
// -----------------------------------------------------------------------------

impl From<PackedGasAndPaymasterAndData> for GasAndPaymasterAndData {
    fn from(packed: PackedGasAndPaymasterAndData) -> Self {
        let mut paymaster_and_data = Vec::with_capacity(20 + 16 + 16 + packed.paymaster_data.len());
        paymaster_and_data.extend_from_slice(packed.paymaster.as_slice());
        paymaster_and_data
            // Get the last 16 bytes of the verification_gas_limit
            .extend_from_slice(
                &packed.paymaster_verification_gas_limit.to_be_bytes::<32>()[16..32],
            );
        paymaster_and_data
            .extend_from_slice(&packed.paymaster_post_op_gas_limit.to_be_bytes::<32>()[16..32]);
        paymaster_and_data.extend_from_slice(&packed.paymaster_data);

        GasAndPaymasterAndData {
            call_gas_limit: packed.call_gas_limit,
            verification_gas_limit: packed.verification_gas_limit,
            pre_verification_gas: packed.pre_verification_gas,
            paymaster_and_data: Bytes::from(paymaster_and_data),
        }
    }
}

// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

/// The alchemy gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AlchemyGasAndPaymasterAndData {
    /// The call gas limit.
    #[serde(rename = "callGasLimit")]
    pub call_gas_limit: U256,
    /// The verification gas limit.
    #[serde(rename = "verificationGasLimit")]
    pub verification_gas_limit: U256,
    /// The pre verification gas.
    #[serde(rename = "preVerificationGas")]
    pub pre_verification_gas: U256,
    /// The max fee per gas.
    #[serde(rename = "maxFeePerGas")]
    pub max_fee_per_gas: U256,
    /// The max priority fee per gas.
    #[serde(rename = "maxPriorityFeePerGas")]
    pub max_priority_fee_per_gas: U256,
    /// The paymaster and data returned by the paymaster.
    #[serde(rename = "paymasterAndData")]
    pub paymaster_and_data: Bytes,
}

/// The alchemy packed gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AlchemyPackedGasAndPaymasterAndData {
    /// The call gas limit.
    #[serde(rename = "callGasLimit")]
    pub call_gas_limit: U256,
    /// The verification gas limit.
    #[serde(rename = "verificationGasLimit")]
    pub verification_gas_limit: U256,
    /// The pre verification gas.
    #[serde(rename = "preVerificationGas")]
    pub pre_verification_gas: U256,
    /// The max fee per gas.
    #[serde(rename = "maxFeePerGas")]
    pub max_fee_per_gas: U256,
    /// The max priority fee per gas.
    #[serde(rename = "maxPriorityFeePerGas")]
    pub max_priority_fee_per_gas: U256,
    /// The paymaster address returned by the paymaster.
    #[serde(rename = "paymaster")]
    pub paymaster: Address,
    /// The paymaster verification gas limit.
    #[serde(rename = "paymasterVerificationGasLimit")]
    pub paymaster_verification_gas_limit: U256,
    /// The paymaster post operation gas limit.
    #[serde(rename = "paymasterPostOpGasLimit")]
    pub paymaster_post_op_gas_limit: U256,
    /// The paymaster data.
    #[serde(rename = "paymasterData")]
    pub paymaster_data: Bytes,
}

/// The biconomy gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BiconomyGasAndPaymasterAndData {
    /// The call gas limit.
    #[serde(rename = "callGasLimit")]
    pub call_gas_limit: U256,
    /// The verification gas limit.
    #[serde(rename = "verificationGasLimit")]
    pub verification_gas_limit: U256,
    /// The pre verification gas.
    #[serde(rename = "preVerificationGas")]
    pub pre_verification_gas: U256,
    /// The paymaster and data returned by the paymaster.
    #[serde(rename = "paymasterAndData")]
    pub paymaster_and_data: Bytes,
    /// The mode of the paymaster.
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

impl From<PackedUserOperation> for UserOperation {
    fn from(packed: PackedUserOperation) -> Self {
        let init_code = if let (Some(factory), factory_data) = (packed.factory, packed.factory_data)
        {
            let mut code = Vec::with_capacity(20 + factory_data.as_ref().map_or(0, |d| d.len()));
            code.extend_from_slice(factory.as_slice());
            if let Some(data) = factory_data {
                code.extend_from_slice(&data);
            }
            Bytes::from(code)
        } else {
            Bytes::default()
        };

        let paymaster_and_data = if let (
            Some(paymaster),
            Some(verification_gas_limit),
            Some(post_op_gas_limit),
            Some(data),
        ) = (
            packed.paymaster,
            packed.paymaster_verification_gas_limit,
            packed.paymaster_post_op_gas_limit,
            packed.paymaster_data,
        ) {
            let mut buffer = Vec::with_capacity(20 + 16 + 16 + data.len());
            buffer.extend_from_slice(paymaster.as_slice());
            buffer.extend_from_slice(&verification_gas_limit.to_be_bytes::<32>()[16..32]);
            buffer.extend_from_slice(&post_op_gas_limit.to_be_bytes::<32>()[16..32]);
            buffer.extend_from_slice(&data);
            Bytes::from(buffer)
        } else {
            Bytes::default()
        };
        Self {
            sender: packed.sender,
            nonce: packed.nonce,
            init_code,
            call_data: packed.call_data,
            call_gas_limit: packed.call_gas_limit,
            verification_gas_limit: packed.verification_gas_limit,
            pre_verification_gas: packed.pre_verification_gas,
            max_fee_per_gas: packed.max_fee_per_gas,
            max_priority_fee_per_gas: packed.max_priority_fee_per_gas,
            paymaster_and_data,
            signature: packed.signature,
        }
    }
}

// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

/// User operation required for the request. (v0.6 without paymaster)
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperationRequest {
    /// The sender.
    pub sender: Address,
    /// The nonce.
    pub nonce: U256,
    /// The init code.
    pub init_code: Bytes,
    /// The call data.
    pub call_data: Bytes,
    /// The call gas limit.
    pub call_gas_limit: Option<U256>,
    /// The verification gas limit.
    pub verification_gas_limit: Option<U256>,
    /// The pre verification gas.
    pub pre_verification_gas: Option<U256>,
    /// The maximum fee per gas.
    pub max_fee_per_gas: Option<U256>,
    /// The maximum priority fee per gas.
    pub max_priority_fee_per_gas: Option<U256>,
    /// The paymaster and data.
    pub paymaster_and_data: Option<Bytes>,
    /// The signature.
    pub signature: Bytes,
}

/// Packed user operation required for the request. (v0.7 with paymaster)
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackedUserOperationRequest {
    /// The sender.
    pub sender: Address,
    /// The nonce.
    pub nonce: U256,
    /// The factory.
    pub factory: Option<Address>,
    /// The factory data.
    pub factory_data: Option<Bytes>,
    /// The call data.
    pub call_data: Bytes,
    /// The call gas limit.
    pub call_gas_limit: Option<U256>,
    /// The verification gas limit.
    pub verification_gas_limit: Option<U256>,
    /// The pre verification gas.
    pub pre_verification_gas: Option<U256>,
    /// The maximum fee per gas.
    pub max_fee_per_gas: Option<U256>,
    /// The maximum priority fee per gas.
    pub max_priority_fee_per_gas: Option<U256>,
    /// The paymaster.
    pub paymaster: Option<Address>,
    /// The paymaster verification gas limit.
    pub paymaster_verification_gas_limit: Option<U256>,
    /// The paymaster post operation gas limit.
    pub paymaster_post_op_gas_limit: Option<U256>,
    /// The paymaster data.
    pub paymaster_data: Option<Bytes>,
    /// The signature.
    pub signature: Bytes,
}

/// User operation request variant
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum UserOperationRequestVariant {
    /// The user operation request.
    Default(UserOperationRequest),
    /// The packed user operation request.
    Packed(PackedUserOperationRequest),
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/types.rs#L27
/// License: MIT
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EstimateResult {
    /// The pre verification gas.
    pub pre_verification_gas: U256,
    /// The verification gas limit.
    pub verification_gas_limit: U256,
    /// The call gas limit.
    pub call_gas_limit: U256,
}

/// The estimate result for the packed user operation.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackedEstimateResult {
    /// The pre verification gas.
    pub pre_verification_gas: U256,
    /// The verification gas limit.
    pub verification_gas_limit: U256,
    /// The call gas limit.
    pub call_gas_limit: U256,
    /// The paymaster verification gas limit.
    pub paymaster_verification_gas_limit: U256,
}

// From: https://github.com/silius-rs/silius/blob/f695b54cbbabf6b3f22f7af8918a2d6d83ca8960/crates/primitives/src/user_operation/mod.rs#L423-L441
// License: Apache-2.0

/// Receipt of the user operation (returned from the RPC endpoint eth_getUserOperationReceipt)
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperationReceipt {
    /// The user operation hash.
    #[serde(rename = "userOpHash")]
    pub user_operation_hash: B256,
    /// The entry point address.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entry_point: Option<Address>,
    /// The sender.
    pub sender: Address,
    /// The nonce.
    pub nonce: U256,
    /// The paymaster.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub paymaster: Option<Address>,
    /// The actual gas cost.
    pub actual_gas_cost: U256,
    /// The actual gas used.
    pub actual_gas_used: U256,
    /// The success.
    pub success: bool,
    /// The reason.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    /// The logs.
    pub logs: Vec<Log>,
    /// The transaction receipt.
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

    #[test]
    fn test_user_operation_packed_conversion() {
        // Create a UserOperation
        let user_op = UserOperation {
            sender: Address::from_slice(&[1u8; 20]),
            nonce: U256::from(42),
            init_code: Bytes::from(vec![2u8; 30]),
            call_data: Bytes::from(vec![3u8; 50]),
            call_gas_limit: U256::from(100000),
            verification_gas_limit: U256::from(200000),
            pre_verification_gas: U256::from(50000),
            max_fee_per_gas: U256::from(1000000000),
            max_priority_fee_per_gas: U256::from(100000000),
            paymaster_and_data: Bytes::from(vec![4u8; 60]),
            signature: Bytes::from(vec![5u8; 65]),
        };

        // Convert UserOperation to PackedUserOperation
        let packed_op: PackedUserOperation = user_op.clone().into();

        // Check the conversion
        assert_eq!(packed_op.sender, user_op.sender);
        assert_eq!(packed_op.nonce, user_op.nonce);
        assert_eq!(packed_op.factory, Some(Address::from_slice(&user_op.init_code[..20])));
        assert_eq!(packed_op.factory_data, Some(Bytes::copy_from_slice(&user_op.init_code[20..])));
        assert_eq!(packed_op.call_data, user_op.call_data);
        assert_eq!(packed_op.call_gas_limit, user_op.call_gas_limit);
        assert_eq!(packed_op.verification_gas_limit, user_op.verification_gas_limit);
        assert_eq!(packed_op.pre_verification_gas, user_op.pre_verification_gas);
        assert_eq!(packed_op.max_fee_per_gas, user_op.max_fee_per_gas);
        assert_eq!(packed_op.max_priority_fee_per_gas, user_op.max_priority_fee_per_gas);

        // Check paymaster_and_data components
        assert_eq!(
            packed_op.paymaster,
            Some(Address::from_slice(&user_op.paymaster_and_data[..20]))
        );
        assert_eq!(
            packed_op.paymaster_verification_gas_limit,
            Some(U256::from_be_slice(&user_op.paymaster_and_data[20..36]))
        );
        assert_eq!(
            packed_op.paymaster_post_op_gas_limit,
            Some(U256::from_be_slice(&user_op.paymaster_and_data[36..52]))
        );
        assert_eq!(
            packed_op.paymaster_data,
            Some(Bytes::copy_from_slice(&user_op.paymaster_and_data[52..]))
        );

        assert_eq!(packed_op.signature, user_op.signature);

        // Convert PackedUserOperation back to UserOperation
        let unpacked_op: UserOperation = packed_op.into();

        // Check the conversion back
        assert_eq!(unpacked_op.sender, user_op.sender);
        assert_eq!(unpacked_op.nonce, user_op.nonce);
        assert_eq!(unpacked_op.init_code, user_op.init_code);
        assert_eq!(unpacked_op.call_data, user_op.call_data);
        assert_eq!(unpacked_op.call_gas_limit, user_op.call_gas_limit);
        assert_eq!(unpacked_op.verification_gas_limit, user_op.verification_gas_limit);
        assert_eq!(unpacked_op.pre_verification_gas, user_op.pre_verification_gas);
        assert_eq!(unpacked_op.max_fee_per_gas, user_op.max_fee_per_gas);
        assert_eq!(unpacked_op.max_priority_fee_per_gas, user_op.max_priority_fee_per_gas);
        assert_eq!(unpacked_op.paymaster_and_data, user_op.paymaster_and_data);
        assert_eq!(unpacked_op.signature, user_op.signature);
    }

    #[test]
    fn test_packed_to_gas_and_paymaster_and_data_conversion() {
        // Create a PackedGasAndPaymasterAndData instance
        let packed = PackedGasAndPaymasterAndData {
            call_gas_limit: U256::from(100000),
            verification_gas_limit: U256::from(200000),
            pre_verification_gas: U256::from(50000),
            paymaster: Address::ZERO,
            paymaster_verification_gas_limit: U256::from(300000),
            paymaster_post_op_gas_limit: U256::from(400000),
            paymaster_data: Bytes::default(),
        };

        // Convert PackedGasAndPaymasterAndData to GasAndPaymasterAndData
        let unpacked: GasAndPaymasterAndData = packed.clone().into();

        // Assertions
        assert_eq!(unpacked.call_gas_limit, packed.call_gas_limit);
        assert_eq!(unpacked.verification_gas_limit, packed.verification_gas_limit);
        assert_eq!(unpacked.pre_verification_gas, packed.pre_verification_gas);
    }
}
