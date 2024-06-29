// Copyright 2023-2024 Light.
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
use lightdotso_db::models::activity::CustomParams;
use lightdotso_prisma::ActivityOperation;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct ActivityMessage {
    pub operation: ActivityOperation,
    pub log: Value,
    pub params: CustomParams,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for ActivityMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "operation": &self.operation,
            "log": &self.log,
            "params": &self.params,
        });

        msg_value.to_string()
    }
}
