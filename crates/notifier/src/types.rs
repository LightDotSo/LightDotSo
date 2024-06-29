// Copyright 2023-2024 Light
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

use lazy_static::lazy_static;
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use serde_json::Value;
use std::collections::BTreeMap;
use strum::IntoEnumIterator;
use strum_macros::{Display, EnumIter, EnumString, IntoStaticStr};

// This is a list of all platforms
#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display)]
pub enum Platform {
    #[strum(serialize = "WEB")]
    Web,
}

// This is a list of all user operations
#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display)]
pub enum UserOnlyOperation {
    #[strum(serialize = "INVITE_CODE_ACCEPTED")]
    InviteCodeAccepted,
}

// Utility function to match the activity entity/operation combination
pub fn match_user_only_notification_with_activity(
    entity: &ActivityEntity,
    operation: &ActivityOperation,
    log: &Value,
) -> Option<UserOnlyOperation> {
    match (entity, operation) {
        (ActivityEntity::InviteCode, ActivityOperation::Update) => {
            // Check if the key of log is status is `USED`
            if log["status"].as_str() == Some("USED") {
                Some(UserOnlyOperation::InviteCodeAccepted)
            } else {
                None
            }
        }
        _ => None,
    }
}

// This is a list of all wallet operations
#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display)]
pub enum WalletOnlyOperation {
    #[strum(serialize = "USER_OPERATION_CREATED")]
    UserOperationCreated,
    #[strum(serialize = "USER_OPERATION_EXECUTED")]
    UserOperationExecuted,
    #[strum(serialize = "TRANSACTION_WITH_USER_OPERATION_EXECUTED")]
    TransactionWithUserOperationExecuted,
}

// Utility function to match the activity entity/operation combination
pub fn match_wallet_only_notification_with_activity(
    entity: &ActivityEntity,
    operation: &ActivityOperation,
    log: &Value,
) -> Option<WalletOnlyOperation> {
    match (entity, operation) {
        (ActivityEntity::UserOperation, ActivityOperation::Create) => {
            Some(WalletOnlyOperation::UserOperationCreated)
        }
        (ActivityEntity::UserOperation, ActivityOperation::Update) => {
            if log["status"].as_str() == Some("EXECUTED") ||
                log["status"].as_str() == Some("REVERTED")
            {
                Some(WalletOnlyOperation::TransactionWithUserOperationExecuted)
            } else {
                None
            }
        }
        (ActivityEntity::Transaction, ActivityOperation::Update) => None,
        _ => None,
    }
}

// Combination utility function to match the activity entity/operation combination
pub fn match_notification_with_activity(
    entity: &ActivityEntity,
    operation: &ActivityOperation,
    log: &Value,
) -> Option<Operation> {
    if let Some(res) = match_user_only_notification_with_activity(entity, operation, log) {
        return Some(Operation::UserOnly(res));
    }

    match_wallet_only_notification_with_activity(entity, operation, log).map(Operation::WalletOnly)
}

// This is a list of all operations
#[derive(Clone, Debug, Display)]
pub enum Operation {
    UserOnly(UserOnlyOperation),
    WalletOnly(WalletOnlyOperation),
}

lazy_static! {
    // This is a list of all operations
    pub static ref OPERATIONS: Vec<Operation> = {
        let mut operations = Vec::new();

        for operation in UserOnlyOperation::iter() {
            operations.push(Operation::UserOnly(operation));
        }

        for operation in WalletOnlyOperation::iter() {
            operations.push(Operation::WalletOnly(operation));
        }

        operations
    };
}

// For each operation, we define a notification type which is all combinations of operation and
// platform
#[derive(Clone, Debug)]
pub enum Notification {
    UserOnly(Platform, UserOnlyOperation),
    WalletOnly(Platform, WalletOnlyOperation),
}

// Implement Display for Notification
impl std::fmt::Display for Notification {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Notification::UserOnly(platform, operation) => {
                write!(f, "{}-{}", platform, operation)
            }
            Notification::WalletOnly(platform, operation) => {
                write!(f, "{}-{}", platform, operation)
            }
        }
    }
}

lazy_static! {
    // This is a list of all notification types
    pub static ref NOTIFICATION: Vec<Notification> = {
        let mut notification_types = Vec::new();

        for operation in UserOnlyOperation::iter() {
            for platform in Platform::iter() {
                notification_types.push(Notification::UserOnly(platform, operation.clone()));
            }
        }

        for operation in WalletOnlyOperation::iter() {
            for platform in Platform::iter() {
                notification_types.push(Notification::WalletOnly(platform, operation.clone()));
            }
        }

        notification_types
    };
}

lazy_static! {
    // This is a list of all user notification types
    pub static ref USER_NOTIFICATION_DEFAULT_ENABLED: BTreeMap<String, bool> = {
        let mut map = BTreeMap::new();

        for notif in NOTIFICATION.iter() {
            if let Notification::UserOnly(_, operation) = notif {
                let is_default_enabled = match operation {
                    UserOnlyOperation::InviteCodeAccepted => true,
                };
                map.insert(notif.to_string(), is_default_enabled);
            }
        }

        map
    };
}

lazy_static! {
    // This is a list of all wallet notification types
    pub static ref WALLET_NOTIFICATION_DEFAULT_ENABLED: BTreeMap<String, bool> = {
        let mut map = BTreeMap::new();

        for notif in NOTIFICATION.iter() {
            if let Notification::WalletOnly(_, operation) = notif {
                let is_default_enabled = match operation {
                    WalletOnlyOperation::UserOperationCreated => true,
                    WalletOnlyOperation::UserOperationExecuted => true,
                    WalletOnlyOperation::TransactionWithUserOperationExecuted => true,
                };
                map.insert(notif.to_string(), is_default_enabled);
            }
        }

        map
    };
}

lazy_static! {
    // This is a list of all notification default enabled
    pub static ref NOTIFICATION_DEFAULT_ENABLED: BTreeMap<String, bool> = {
        let mut map = BTreeMap::new();

        for (key, value) in &*USER_NOTIFICATION_DEFAULT_ENABLED {
            map.insert(key.clone(), *value);
        }

        for (key, value) in &*WALLET_NOTIFICATION_DEFAULT_ENABLED {
            map.insert(key.clone(), *value);
        }

        map
    };
}

lazy_static! {
    // This is a list of all user notification keys
    pub static ref USER_NOTIFICATION_KEYS: Vec<String> = {
        let mut user_notification_keys = Vec::new();

        for notif in NOTIFICATION.iter() {
            if let Notification::UserOnly(_, _) = notif {
                user_notification_keys.push(notif.to_string());
            }
        }

        user_notification_keys
    };
}

lazy_static! {
    // This is a list of all wallet notification keys
    pub static ref WALLET_NOTIFICATION_KEYS: Vec<String> = {
        let mut wallet_notification_keys = Vec::new();

        for notif in NOTIFICATION.iter() {
            if let Notification::WalletOnly(_, _) = notif {
                wallet_notification_keys.push(notif.to_string());
            }
        }

        wallet_notification_keys
    };
}

lazy_static! {
    // This is a list of all notification keys
    pub static ref NOTIFICATION_KEYS: Vec<String> = {
        let mut notification_keys = Vec::new();

        for notification in NOTIFICATION.iter() {
            notification_keys.push(notification.to_string());
        }

        notification_keys
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_notification_keys() {
        for key in USER_NOTIFICATION_KEYS.iter() {
            println!("{}", key);
        }
        insta::assert_snapshot!("USER_NOTIFICATION_KEYS", format!("{:?}", *USER_NOTIFICATION_KEYS));
    }

    #[test]
    fn test_wallet_notification_keys() {
        for key in WALLET_NOTIFICATION_KEYS.iter() {
            println!("{}", key);
        }
        insta::assert_snapshot!(
            "WALLET_NOTIFICATION_KEYS",
            format!("{:?}", *WALLET_NOTIFICATION_KEYS)
        );
    }

    #[test]
    fn test_notification_keys() {
        for key in NOTIFICATION_KEYS.iter() {
            println!("{}", key);
        }
        insta::assert_snapshot!("NOTIFICATION_KEYS", format!("{:?}", *NOTIFICATION_KEYS));
    }

    #[test]
    fn test_operations() {
        for operation in OPERATIONS.iter() {
            println!("{}", operation);
        }
        insta::assert_snapshot!("OPERATIONS", format!("{:?}", *OPERATIONS));
    }

    #[test]
    fn test_notification() {
        for notification in NOTIFICATION.iter() {
            println!("{}", notification);
        }
        insta::assert_snapshot!("NOTIFICATION", format!("{:?}", *NOTIFICATION));
    }

    #[test]
    fn test_notification_default_enabled() {
        insta::assert_snapshot!(
            "NOTIFICATION_DEFAULT_ENABLED",
            format!("{:?}", *NOTIFICATION_DEFAULT_ENABLED)
        );
    }

    #[test]
    fn test_user_notification_default_enabled() {
        insta::assert_snapshot!(
            "USER_NOTIFICATION_DEFAULT_ENABLED",
            format!("{:?}", *USER_NOTIFICATION_DEFAULT_ENABLED)
        );
    }

    #[test]
    fn test_wallet_notification_default_enabled() {
        insta::assert_snapshot!(
            "WALLET_NOTIFICATION_DEFAULT_ENABLED",
            format!("{:?}", *WALLET_NOTIFICATION_DEFAULT_ENABLED)
        );
    }
}
