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

use crate::traits::ToJson;
use ethers::types::{Bytes, H160, U256};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymasterOperationMessage {
    pub chain_id: u64,
    pub sender: H160,
    pub call_gas_limit: U256,
    pub verification_gas_limit: U256,
    pub pre_verification_gas: U256,
    pub paymaster_and_data: Bytes,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for PaymasterOperationMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "chain_id": self.chain_id,
            "sender": self.sender,
            "call_gas_limit": self.call_gas_limit,
            "verification_gas_limit": self.verification_gas_limit,
            "pre_verification_gas": self.pre_verification_gas,
            "paymaster_and_data": self.paymaster_and_data,
        });

        msg_value.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ethers::types::Bytes;
    use serde_json::Result;

    // Test `ToJson` trait's `to_json` method for the `PaymasterOperationMessage`
    #[test]
    fn test_to_json() {
        let msg = PaymasterOperationMessage {
            chain_id: 1u64,
            sender: H160::zero(),
            call_gas_limit: 0u64.into(),
            verification_gas_limit: 0u64.into(),
            pre_verification_gas: 0u64.into(),
            paymaster_and_data: Bytes::default(),
        };

        let json_str = msg.to_json();

        println!("{}", json_str);
    }

    // Test serialization and deserialization
    #[test]
    fn test_serialization_deserialization() -> Result<()> {
        let original_msg = PaymasterOperationMessage {
            chain_id: 1u64,
            sender: H160::zero(),
            call_gas_limit: 0u64.into(),
            verification_gas_limit: 0u64.into(),
            pre_verification_gas: 0u64.into(),
            paymaster_and_data: Bytes::default(),
        };

        let serialized = serde_json::to_string(&original_msg)?;
        let deserialized: PaymasterOperationMessage = serde_json::from_str(&serialized)?;

        assert_eq!(original_msg.chain_id, deserialized.chain_id);
        assert_eq!(original_msg.sender, deserialized.sender);
        assert_eq!(original_msg.call_gas_limit, deserialized.call_gas_limit);

        Ok(())
    }
}
