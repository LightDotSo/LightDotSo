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

use lazy_static::lazy_static;
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use serde_json::Value;

// The all supported platforms for the notification
lazy_static! {
    pub static ref PLATFORM_ANDROID: String = "android".to_string();
    pub static ref PLATFORM_IOS: String = "ios".to_string();
    pub static ref PLATFORM_WEB: String = "web".to_string();
}

// The array of all supported platforms
lazy_static! {
    pub static ref PLATFORMS: Vec<String> =
        vec![PLATFORM_ANDROID.to_string(), PLATFORM_IOS.to_string(), PLATFORM_WEB.to_string()];
}

// The user operation create topic
lazy_static! {
    pub static ref USER_OPERATION_CREATED: String = "user-operation-created".to_string();
}

// The user operation execute topic
lazy_static! {
    pub static ref USER_OPERATION_EXECUTED: String = "user-operation-executed".to_string();
}

// The transaction w/ user operation topic
lazy_static! {
    pub static ref TRANSACTION_WITH_USER_OPERATIOND_EXECUTE: String =
        "transaction-with-user-operation-executed".to_string();
}

// The invite code accepted topic
lazy_static! {
    pub static ref INVITE_CODE_ACCEPTED: String = "invite-code-accepted".to_string();
}

// The array of all user only operations
lazy_static! {
    pub static ref USER_ONLY_OPERATIONS: Vec<String> = vec![INVITE_CODE_ACCEPTED.to_string(),];
}

// Utility function to check if the activity is user only
pub fn is_user_only_activity(entity: &ActivityEntity, operation: &ActivityOperation) -> bool {
    matches!(
        (entity, operation),
        (ActivityEntity::InviteCode, ActivityOperation::Update) |
            (ActivityEntity::User, ActivityOperation::Create)
    )
}

// Utility function to match the activity entity/operation combination
pub fn match_user_only_notification_with_activity(
    entity: &ActivityEntity,
    operation: &ActivityOperation,
    log: &Value,
) -> Option<String> {
    match (entity, operation) {
        (ActivityEntity::InviteCode, ActivityOperation::Update) => {
            // Check if the key of log is status is `USED`
            if log["status"].as_str() == Some("USED") {
                Some(INVITE_CODE_ACCEPTED.to_string())
            } else {
                None
            }
        }
        _ => None,
    }
}

// The array of all wallet only operations
lazy_static! {
    pub static ref WALLET_ONLY_OPERATIONS: Vec<String> = vec![
        USER_OPERATION_CREATED.to_string(),
        USER_OPERATION_EXECUTED.to_string(),
        TRANSACTION_WITH_USER_OPERATIOND_EXECUTE.to_string()
    ];
}

// The array of all supported operations
lazy_static! {
    pub static ref OPERATIONS: Vec<String> = {
        let mut vec = Vec::new();
        for user_only_operation in USER_ONLY_OPERATIONS.iter() {
            vec.push(user_only_operation.to_string());
        }
        for wallet_only_operation in WALLET_ONLY_OPERATIONS.iter() {
            vec.push(wallet_only_operation.to_string());
        }
        vec
    };
}

// Utility function to format the combination of platform and operation
fn format_combination(platform: &String, operation: &String) -> String {
    format!("{}-{}", platform, operation)
}

// The full mapping of notification keys
lazy_static! {
    pub static ref NOTIFICATION_MAPPING: Vec<String> = {
        let mut vec = Vec::new();
        for platform in PLATFORMS.iter() {
            for operation in OPERATIONS.iter() {
                vec.push(format_combination(platform, operation));
            }
        }
        vec
    };
}
