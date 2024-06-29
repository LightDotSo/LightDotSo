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
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NotificationMessage {
    /// The activity id
    pub activity_id: String,
    /// The key of the notification
    pub key: String,
    /// The user id of the notification
    pub user_id: Option<String>,
    /// The wallet address of the notification
    pub wallet_address: Option<String>,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for NotificationMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "activity_id": &self.activity_id,
            "key": &self.key,
            "user_id": &self.user_id,
            "wallet_address": &self.wallet_address,
        });

        msg_value.to_string()
    }
}
