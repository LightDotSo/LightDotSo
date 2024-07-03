// Copyright 2023-2024 Light, Inc.
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
use ethers::types::H160;
use lightdotso_contracts::types::GasAndPaymasterAndData;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymasterOperationMessage {
    pub chain_id: u64,
    pub sender: H160,
    pub gas_and_paymaster_and_data: GasAndPaymasterAndData,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for PaymasterOperationMessage {
    fn to_json(&self) -> String {
        let gas_and_paymaster_and_data = json!({
            "call_gas_limit": self.gas_and_paymaster_and_data.call_gas_limit,
            "verification_gas_limit": self.gas_and_paymaster_and_data.verification_gas_limit,
            "pre_verification_gas": self.gas_and_paymaster_and_data.pre_verification_gas,
            "paymaster_and_data": self.gas_and_paymaster_and_data.paymaster_and_data,
        });

        let msg_value: Value = json!({
            "chain_id": self.chain_id,
            "sender": self.sender,
            "gas_and_paymaster_and_data": gas_and_paymaster_and_data,
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
            gas_and_paymaster_and_data: GasAndPaymasterAndData {
                call_gas_limit: 0u64.into(),
                verification_gas_limit: 0u64.into(),
                pre_verification_gas: 0u64.into(),
                paymaster_and_data: Bytes::default(),
            },
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
            gas_and_paymaster_and_data: GasAndPaymasterAndData {
                call_gas_limit: 0u64.into(),
                verification_gas_limit: 0u64.into(),
                pre_verification_gas: 0u64.into(),
                paymaster_and_data: Bytes::default(),
            },
        };

        let serialized = serde_json::to_string(&original_msg)?;
        let deserialized: PaymasterOperationMessage = serde_json::from_str(&serialized)?;

        assert_eq!(original_msg.chain_id, deserialized.chain_id);
        assert_eq!(original_msg.sender, deserialized.sender);
        assert_eq!(
            original_msg.gas_and_paymaster_and_data.call_gas_limit,
            deserialized.gas_and_paymaster_and_data.call_gas_limit
        );

        Ok(())
    }
}
