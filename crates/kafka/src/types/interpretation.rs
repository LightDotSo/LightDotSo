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
