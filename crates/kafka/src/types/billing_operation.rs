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
use ethers::types::Address;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct BillingOperationMessage {
    pub chain_id: u64,
    pub paymaster_operation_id: String,
    pub sender: Address,
    pub pre_verification_gas: u64,
    pub verification_gas_limit: u64,
    pub call_gas_limit: u64,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for BillingOperationMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "chain_id": self.chain_id,
            "paymaster_operation_id": self.paymaster_operation_id,
            "sender": self.sender.to_string(),
            "pre_verification_gas": self.pre_verification_gas,
            "verification_gas_limit": self.verification_gas_limit,
            "call_gas_limit": self.call_gas_limit,
        });

        msg_value.to_string()
    }
}
