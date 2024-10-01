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

use crate::types::PackedUserOperation;
use alloy::{
    dyn_abi::DynSolValue,
    primitives::{keccak256, Address, Bytes, B256, U256},
};

impl PackedUserOperation {
    /// Hash a user operation with the given entry point and chain id.
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

    /// Reconstructs the init_code from factory and factory_data
    pub fn init_code(&self) -> Bytes {
        // If the factory is address(0), then return an empty bytes array
        if self.factory.unwrap_or_default() == Address::ZERO {
            return Bytes::default();
        }

        match (&self.factory, &self.factory_data) {
            (Some(factory), Some(data)) => {
                let mut code = Vec::with_capacity(20 + data.len());
                code.extend_from_slice(factory.as_slice());
                code.extend_from_slice(data);
                Bytes::from(code)
            }
            (Some(factory), None) => Bytes::copy_from_slice(factory.as_slice()),
            _ => Bytes::default(),
        }
    }

    /// Reconstructs the paymaster_and_data
    pub fn paymaster_and_data(&self) -> Bytes {
        // If the paymaster is address(0), then return an empty bytes array
        if self.paymaster.unwrap_or_default() == Address::ZERO {
            return Bytes::default();
        }

        match (
            &self.paymaster,
            &self.paymaster_verification_gas_limit,
            &self.paymaster_post_op_gas_limit,
            &self.paymaster_data,
        ) {
            (Some(paymaster), Some(verification_gas), Some(post_op_gas), Some(data)) => {
                let mut pmd = Vec::with_capacity(20 + 16 + 16 + data.len());
                pmd.extend_from_slice(paymaster.as_slice());
                pmd.extend_from_slice(&verification_gas.to_be_bytes::<32>()[16..]);
                pmd.extend_from_slice(&post_op_gas.to_be_bytes::<32>()[16..]);
                pmd.extend_from_slice(data);
                Bytes::from(pmd)
            }
            _ => Bytes::default(),
        }
    }

    /// Calculates the packed account gas limits
    pub fn account_gas_limits(&self) -> U256 {
        (U256::from(self.verification_gas_limit) << 128) | U256::from(self.call_gas_limit)
    }

    /// Calculates the packed gas fees
    pub fn gas_fees(&self) -> U256 {
        (U256::from(self.max_priority_fee_per_gas) << 128) | U256::from(self.max_fee_per_gas)
    }
    /// Gets the byte array representation of the user operation to be used in the signature
    pub fn pack_for_hash(&self) -> Bytes {
        let hash_init_code = keccak256(self.init_code());
        let hash_call_data = keccak256(&self.call_data);
        let account_gas_limits = self.account_gas_limits();
        let hash_paymaster_and_data = keccak256(self.paymaster_and_data());
        let gas_fees = self.gas_fees();

        DynSolValue::Tuple(vec![
            DynSolValue::Address(self.sender),
            DynSolValue::Uint(self.nonce, 256),
            DynSolValue::FixedBytes(hash_init_code, 32),
            DynSolValue::FixedBytes(hash_call_data, 32),
            DynSolValue::Uint(account_gas_limits, 256),
            DynSolValue::Uint(self.pre_verification_gas, 256),
            DynSolValue::Uint(gas_fees, 256),
            DynSolValue::FixedBytes(hash_paymaster_and_data, 32),
        ])
        .abi_encode()
        .into()
    }
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use crate::address::ENTRYPOINT_V070_ADDRESS;

    use super::*;

    #[test]
    fn test_hash_zeroed() {
        // Testing a user operation hash against the hash generated by the
        // entrypoint contract getUserOpHash() function with entrypoint address
        // at 0x0000000071727De22E5E9d8BAf0edAc6f37da032 and chain ID 31337.

        // Hash: 0x9458fc5cb67d5a77d2c044a9e80cd5040d4f90152e31e7807bbf03d3ff34dfdf
        let operation = PackedUserOperation {
            sender: "0x0000000000000000000000000000000000000000".parse().unwrap(),
            nonce: U256::ZERO,
            factory: None,
            factory_data: None,
            call_data: Bytes::default(),
            call_gas_limit: U256::ZERO,
            verification_gas_limit: U256::ZERO,
            pre_verification_gas: U256::ZERO,
            max_fee_per_gas: U256::ZERO,
            max_priority_fee_per_gas: U256::ZERO,
            paymaster: None,
            paymaster_verification_gas_limit: None,
            paymaster_post_op_gas_limit: None,
            paymaster_data: None,
            signature: Bytes::default(),
        };
        let entry_point = *ENTRYPOINT_V070_ADDRESS;
        let chain_id = 31337;
        let hash = operation.op_hash(entry_point, chain_id);
        assert_eq!(
            format!("0x{:x}", hash),
            "0x5f747cb1c81ad5704267c33fcd46224a19068012df5ed00e0d5be49e7ec972ec"
        );
    }

    #[test]
    fn test_hash() {
        // Testing a user operation hash against the hash generated by the
        // entrypoint contract getUserOpHash() function with entrypoint address
        // at 0x0000000071727De22E5E9d8BAf0edAc6f37da032 and chain ID 31337.

        // Hash: 0x6a157b366d1289770e4c5b3b2e929003e263fb245eee9ea8150f252d2db4dd3c
        let operation = PackedUserOperation {
            sender: "0x1306b01bC3e4AD202612D3843387e94737673F53".parse().unwrap(),
            nonce: U256::from(8942),
            factory: Some("0x1306b01bC3e4AD202612D3843387e94737673F53".parse().unwrap()),
            factory_data: Some("0x0000000000000000000000000000000000000000080085".parse().unwrap()),
            call_data: "0x0000000000000000000000000000000000000000080085".parse().unwrap(),
            call_gas_limit: U256::from(100000),
            verification_gas_limit: U256::from(100000),
            pre_verification_gas: U256::from(100),
            max_fee_per_gas: U256::from(9999999),
            max_priority_fee_per_gas: U256::from(9999999),
            paymaster: Some("0x000000000018d32DF916ff115A25fbeFC70bAf8b".parse().unwrap()),
            paymaster_verification_gas_limit: Some(U256::from(100000)),
            paymaster_post_op_gas_limit: Some(U256::from(100000)),
            paymaster_data: Some(
                "0x0000000000000000000000000000000000000000080085".parse().unwrap(),
            ),
            signature: "0xda0929f527cded8d0a1eaf2e8861d7f7e2d8160b7b13942f99dd367df4473a"
                .parse()
                .unwrap(),
        };
        let entry_point = *ENTRYPOINT_V070_ADDRESS;
        let chain_id = 31337;
        let hash = operation.op_hash(entry_point, chain_id);

        assert_eq!(format!("{:x}", operation.init_code()), "0x1306b01bc3e4ad202612d3843387e94737673f530000000000000000000000000000000000000000080085");
        assert_eq!(
            format!("{:x}", operation.paymaster_and_data()),
            "0x000000000018d32df916ff115a25fbefc70baf8b000000000000000000000000000186a0000000000000000000000000000186a00000000000000000000000000000000000000000080085"
        );
        assert_eq!(
            format!("0x{:x}", hash),
            "0x6a157b366d1289770e4c5b3b2e929003e263fb245eee9ea8150f252d2db4dd3c"
        );
    }
}
