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
use ethers::types::H256;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct InterpretationMessage {
    pub transaction_hash: Option<H256>,
    pub user_operation_hash: Option<H256>,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for InterpretationMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "transaction_hash": &self.transaction_hash,
            "user_operation_hash": &self.user_operation_hash,
        });

        msg_value.to_string()
    }
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Result;

    // Helper function to create mock H256 hash
    fn h256_mock() -> H256 {
        // Replace with actual mock generation
        H256::from_slice(&[1u8; 32])
    }

    // Test `ToJson` trait's `to_json` method for the `InterpretationMessage`
    #[test]
    fn test_to_json() {
        let msg = InterpretationMessage {
            transaction_hash: Some(h256_mock()),
            user_operation_hash: Some(h256_mock()),
        };

        let json_str = msg.to_json();
        let expected_str = format!(
            "{{\"transaction_hash\":\"{:?}\",\"user_operation_hash\":\"{:?}\"}}",
            msg.transaction_hash.unwrap(),
            msg.user_operation_hash.unwrap()
        );

        assert_eq!(json_str, expected_str);
    }

    // Test serialization and deserialization
    #[test]
    fn test_serialization_deserialization() -> Result<()> {
        let original_msg = InterpretationMessage {
            transaction_hash: Some(h256_mock()),
            user_operation_hash: None,
        };

        let serialized = original_msg.to_json();
        let deserialized: InterpretationMessage = serde_json::from_str(&serialized)?;

        assert_eq!(original_msg.transaction_hash, deserialized.transaction_hash);
        assert_eq!(original_msg.user_operation_hash, None);

        Ok(())
    }
}
