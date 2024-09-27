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

// Copyright 2023-2024 Silius Contributors.
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

// This file is part of Rundler.
//
// Rundler is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later version.
//
// Rundler is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with Rundler.
// If not, see https://www.gnu.org/licenses/.

use crate::{tracer::LogInfo, types::UserOperation};
use alloy::{
    dyn_abi::DynSolValue,
    hex,
    primitives::{keccak256, Address, Bytes, FixedBytes, B256, U256},
    rpc::types::RawLog,
};
use core::fmt::Debug;
use eyre::{eyre, Result};
use std::str::FromStr;

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// A trait for types (events) that can be decoded from a `RawLog`
pub trait EthLogDecode: Send + Sync {
    /// decode from a `RawLog`
    fn decode_log(log: &RawLog) -> Result<Self, Box<dyn std::error::Error>>
    where
        Self: Sized;
}

// From: https://github.com/silius-rs/silius/blob/62cff148f386283bc44114ec9d545eae427489f2/crates/mempool/src/estimate.rs#L80
// License: Apache-2.0

/// Parse the user operation event from the log
/// Since the user operation event is a generic event, we need to parse it with the specific type
/// `T` that implements `EthLogDecode`
pub fn parse_user_op_event<T: EthLogDecode>(event: &LogInfo) -> Result<T> {
    let topics = event
        .topics
        .iter()
        .map(|t| {
            let mut hash_str = t.clone();
            if hash_str.len() % 2 != 0 {
                hash_str.insert(0, '0');
            };
            hex::decode(hash_str).map(|mut b| {
                b.resize(32, 0);
                FixedBytes::<32>::from_slice(b.as_ref())
            })
        })
        .collect::<Result<Vec<FixedBytes<32>>, _>>()
        .map_err(|e| {
            eyre!("simulate handle user op failed on parsing user op event topic hash, {e:?}")
        })?;
    let data = Bytes::from_str(event.data.as_str()).map_err(|e| {
        eyre!("simulate handle user op failed on parsing user op event data: {e:?}")
    })?;

    // Create the log
    let log = RawLog { address: Address::ZERO, topics, data };

    <T>::decode_log(&log)
        .map_err(|err| eyre!("simulate handle user op failed on parsing user op event: {err:?}"))
}

// From: https://github.com/alchemyplatform/rundler/blob/b253c4870b069ffdc16a8ca936fe9ad24e1ac44d/crates/types/src/user_operation.rs#L1-L299
// License: GNU Lesser General Public License v3.0

/// Number of bytes in the fixed size portion of an ABI encoded user operation
const PACKED_USER_OPERATION_FIXED_LEN: usize = 480;

/// Unique identifier for a user operation from a given sender
#[derive(Debug, Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct UserOperationId {
    sender: Address,
    nonce: U256,
}

impl UserOperation {
    /// Hash a user operation with the given entry point and chain ID.
    ///
    /// The hash is used to uniquely identify a user operation in the entry point.
    /// It does not include the signature field.
    pub fn op_hash(&self, entry_point: Address, chain_id: u64) -> B256 {
        keccak256(
            DynSolValue::Tuple(vec![
                DynSolValue::FixedBytes(
                    keccak256(self.pack_for_hash()),
                    self.pack_for_hash().len(),
                ),
                DynSolValue::Address(entry_point),
                DynSolValue::Uint(U256::from(chain_id), 256),
            ])
            .abi_encode(),
        )
    }

    /// Get the unique identifier for this user operation from its sender
    pub fn id(&self) -> UserOperationId {
        UserOperationId { sender: self.sender, nonce: self.nonce }
    }

    /// Get the address of the factory entity associated with this user operation, if any
    pub fn factory(&self) -> Option<Address> {
        Self::get_address_from_field(&self.init_code)
    }

    /// Get the address of the paymaster entity associated with this user operation, if any
    pub fn paymaster(&self) -> Option<Address> {
        Self::get_address_from_field(&self.paymaster_and_data)
    }

    /// Extracts an address from the beginning of a data field
    /// Useful to extract the paymaster address from paymaster_and_data
    /// and the factory address from init_code
    pub fn get_address_from_field(data: &Bytes) -> Option<Address> {
        if data.len() < 20 {
            None
        } else {
            Some(Address::from_slice(&data[..20]))
        }
    }

    /// Efficient calculation of the size of a packed user operation
    pub fn abi_encoded_size(&self) -> usize {
        PACKED_USER_OPERATION_FIXED_LEN +
            pad_len(&self.init_code) +
            pad_len(&self.call_data) +
            pad_len(&self.paymaster_and_data) +
            pad_len(&self.signature)
    }

    /// Compute the amount of heap memory the UserOperation takes up.
    pub fn heap_size(&self) -> usize {
        self.init_code.len() +
            self.call_data.len() +
            self.paymaster_and_data.len() +
            self.signature.len()
    }

    /// Gets the byte array representation of the user operation to be used in the signature
    pub fn pack_for_hash(&self) -> Bytes {
        let hash_init_code = keccak256(self.init_code.clone());
        let hash_call_data = keccak256(self.call_data.clone());
        let hash_paymaster_and_data = keccak256(self.paymaster_and_data.clone());

        DynSolValue::Tuple(vec![
            DynSolValue::Address(self.sender),
            DynSolValue::Uint(self.nonce, 256),
            DynSolValue::FixedBytes(hash_init_code, hash_init_code.to_vec().len()),
            DynSolValue::FixedBytes(hash_call_data, hash_call_data.to_vec().len()),
            DynSolValue::Uint(self.call_gas_limit, 256),
            DynSolValue::Uint(self.verification_gas_limit, 256),
            DynSolValue::Uint(self.pre_verification_gas, 256),
            DynSolValue::Uint(self.max_fee_per_gas, 256),
            DynSolValue::Uint(self.max_priority_fee_per_gas, 256),
            DynSolValue::FixedBytes(
                hash_paymaster_and_data,
                hash_paymaster_and_data.to_vec().len(),
            ),
        ])
        .abi_encode()
        .into()
    }
}

/// Calculates the size a byte array padded to the next largest multiple of 32
fn pad_len(b: &Bytes) -> usize {
    (b.len() + 31) & !31
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_zeroed() {
        // Testing a user operation hash against the hash generated by the
        // entrypoint contract getUserOpHash() function with entrypoint address
        // at 0x66a15edcc3b50a663e72f1457ffd49b9ae284ddc and chain ID 1337.
        //
        // UserOperation = {
        //     sender: '0x0000000000000000000000000000000000000000',
        //     nonce: 0,
        //     initCode: '0x',
        //     callData: '0x',
        //     callGasLimit: 0,
        //     verificationGasLimit: 0,
        //     preVerificationGas: 0,
        //     maxFeePerGas: 0,
        //     maxPriorityFeePerGas: 0,
        //     paymasterAndData: '0x',
        //     signature: '0x',
        //   }
        //
        // Hash: 0xdca97c3b49558ab360659f6ead939773be8bf26631e61bb17045bb70dc983b2d
        let operation = UserOperation {
            sender: "0x0000000000000000000000000000000000000000".parse().unwrap(),
            nonce: U256::ZERO,
            init_code: Bytes::default(),
            call_data: Bytes::default(),
            call_gas_limit: U256::ZERO,
            verification_gas_limit: U256::ZERO,
            pre_verification_gas: U256::ZERO,
            max_fee_per_gas: U256::ZERO,
            max_priority_fee_per_gas: U256::ZERO,
            paymaster_and_data: Bytes::default(),
            signature: Bytes::default(),
        };
        let entry_point = "0x66a15edcc3b50a663e72f1457ffd49b9ae284ddc".parse().unwrap();
        let chain_id = 1337;
        let hash = operation.op_hash(entry_point, chain_id);
        assert_eq!(
            format!("0x{:x}", hash),
            "0xdca97c3b49558ab360659f6ead939773be8bf26631e61bb17045bb70dc983b2d"
        );
    }

    #[test]
    fn test_hash() {
        // Testing a user operation hash against the hash generated by the
        // entrypoint contract getUserOpHash() function with entrypoint address
        // at 0x66a15edcc3b50a663e72f1457ffd49b9ae284ddc and chain ID 1337.
        //
        // UserOperation = {
        //     sender: '0x1306b01bc3e4ad202612d3843387e94737673f53',
        //     nonce: 8942,
        //     initCode: '0x6942069420694206942069420694206942069420',
        //     callData: '0x0000000000000000000000000000000000000000080085',
        //     callGasLimit: 10000,
        //     verificationGasLimit: 100000,
        //     preVerificationGas: 100,
        //     maxFeePerGas: 99999,
        //     maxPriorityFeePerGas: 9999999,
        //     paymasterAndData:
        //       '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        //     signature:
        //       '0xda0929f527cded8d0a1eaf2e8861d7f7e2d8160b7b13942f99dd367df4473a',
        //   }
        //
        // Hash: 0x484add9e4d8c3172d11b5feb6a3cc712280e176d278027cfa02ee396eb28afa1
        let operation = UserOperation {
            sender: "0x1306b01bc3e4ad202612d3843387e94737673f53".parse().unwrap(),
            nonce: U256::from(8942),
            init_code: "0x6942069420694206942069420694206942069420".parse().unwrap(),
            call_data: "0x0000000000000000000000000000000000000000080085".parse().unwrap(),
            call_gas_limit: U256::from(10000),
            verification_gas_limit: U256::from(100000),
            pre_verification_gas: U256::from(100),
            max_fee_per_gas: U256::from(99999),
            max_priority_fee_per_gas: U256::from(9999999),
            paymaster_and_data:
                "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
                    .parse()
                    .unwrap(),
            signature: "0xda0929f527cded8d0a1eaf2e8861d7f7e2d8160b7b13942f99dd367df4473a"
                .parse()
                .unwrap(),
        };
        let entry_point = "0x66a15edcc3b50a663e72f1457ffd49b9ae284ddc".parse().unwrap();
        let chain_id = 1337;
        let hash = operation.op_hash(entry_point, chain_id);
        assert_eq!(
            format!("0x{:x}", hash),
            "0x484add9e4d8c3172d11b5feb6a3cc712280e176d278027cfa02ee396eb28afa1"
        );
    }
}
