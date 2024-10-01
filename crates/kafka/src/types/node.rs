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
pub struct NodeMessage {
    pub hash: B256,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for NodeMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "hash": format!("{:?}", self.hash),
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

    #[test]
    fn test_to_json() {
        let msg = NodeMessage { hash: B256::from_slice(&[1u8; 32]) };

        let json_str = msg.to_json();
        let expected_str = format!("{{\"hash\":\"{:?}\"}}", msg.hash);
        assert_eq!(json_str, expected_str);
    }
}
