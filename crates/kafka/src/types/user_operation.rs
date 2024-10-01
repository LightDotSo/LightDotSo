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
use alloy::primitives::B256;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct UserOperationMessage {
    pub hash: B256,
    pub chain_id: u64,
    pub is_pending_update: bool,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for UserOperationMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "hash": format!("{:?}", self.hash),
            "chain_id": self.chain_id,
            "is_pending_update": self.is_pending_update,
        });

        msg_value.to_string()
    }
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Result;

    // Helper function to create mock B256 hash
    fn b256_mock() -> B256 {
        // Replace with actual mock generation
        B256::from_slice(&[1u8; 32])
    }

    // Test `ToJson` trait's `to_json` method for the `UserOperationMessage`
    #[test]
    fn test_to_json() {
        let msg =
            UserOperationMessage { hash: b256_mock(), chain_id: 1u64, is_pending_update: true };

        let json_str = msg.to_json();
        let expected_str =
            format!("{{\"hash\":\"{:?}\",\"chain_id\":1,\"is_pending_update\":true}}", msg.hash);

        assert_eq!(json_str, expected_str);
    }

    // Test serialization and deserialization
    #[test]
    fn test_serialization_deserialization() -> Result<()> {
        let original_msg =
            UserOperationMessage { hash: b256_mock(), chain_id: 137, is_pending_update: true };

        let serialized = serde_json::to_string(&original_msg)?;
        let deserialized: UserOperationMessage = serde_json::from_str(&serialized)?;

        assert_eq!(original_msg.hash, deserialized.hash);
        assert_eq!(original_msg.chain_id, deserialized.chain_id);

        Ok(())
    }
}
