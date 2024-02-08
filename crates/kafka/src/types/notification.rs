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
