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
    hex,
    primitives::{Address, Bytes, Log, B256, U256},
    rpc::types::{Transaction, TransactionReceipt},
};
use lightdotso_prisma::user_operation;
use serde::{Deserialize, Serialize};
use std::fmt;

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

/// User operation required for the request.
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperation {
    pub sender: Address,
    pub nonce: U256,
    pub init_code: Bytes,
    pub call_data: Bytes,
    pub call_gas_limit: U256,
    pub verification_gas_limit: U256,
    pub pre_verification_gas: U256,
    pub max_fee_per_gas: U256,
    pub max_priority_fee_per_gas: U256,
    pub paymaster_and_data: Bytes,
    pub signature: Bytes,
}

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

impl fmt::Debug for UserOperation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("UserOperation")
            .field("sender", &format!("{:#x}", self.sender))
            .field("nonce", &format!("{:#x}", self.nonce))
            .field("init_code", &format!("0x{}", hex::encode(&self.init_code)))
            .field("call_data", &format!("0x{}", hex::encode(&self.call_data)))
            .field("call_gas_limit", &format!("{:#x}", self.call_gas_limit))
            .field("verification_gas_limit", &format!("{:#x}", self.verification_gas_limit))
            .field("pre_verification_gas", &format!("{:#x}", self.pre_verification_gas))
            .field("max_fee_per_gas", &format!("{:#x}", self.max_fee_per_gas))
            .field("max_priority_fee_per_gas", &format!("{:#x}", self.max_priority_fee_per_gas))
            .field("paymaster_and_data", &format!("0x{}", hex::encode(&self.paymaster_and_data)))
            .field("signature", &format!("0x{}", hex::encode(&self.signature)))
            .finish()
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

/// User operation required for the request.
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperationConstruct {
    pub sender: Address,
    pub nonce: U256,
    pub init_code: Bytes,
    pub call_data: Bytes,
    pub call_gas_limit: U256,
    pub verification_gas_limit: U256,
    pub pre_verification_gas: U256,
    pub max_fee_per_gas: U256,
    pub max_priority_fee_per_gas: U256,
    pub signature: Bytes,
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

impl fmt::Debug for UserOperationConstruct {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("UserOperationConstruct")
            .field("sender", &format!("{:#x}", self.sender))
            .field("nonce", &format!("{:#x}", self.nonce))
            .field("init_code", &format!("0x{}", hex::encode(&self.init_code)))
            .field("call_data", &format!("0x{}", hex::encode(&self.call_data)))
            .field("call_gas_limit", &format!("{:#x}", self.call_gas_limit))
            .field("verification_gas_limit", &format!("{:#x}", self.verification_gas_limit))
            .field("pre_verification_gas", &format!("{:#x}", self.pre_verification_gas))
            .field("max_fee_per_gas", &format!("{:#x}", self.max_fee_per_gas))
            .field("max_priority_fee_per_gas", &format!("{:#x}", self.max_priority_fee_per_gas))
            .field("signature", &format!("0x{}", hex::encode(&self.signature)))
            .finish()
    }
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
