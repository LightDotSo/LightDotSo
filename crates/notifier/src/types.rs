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
use std::collections::HashMap;
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
    pub static ref USER_NOTIFICATION_DEFAULT_ENABLED: HashMap<String, bool> = {
        let mut map = HashMap::new();

        for notif in NOTIFICATION.iter() {
            if let Notification::UserOnly(_, operation) = notif {
                let is_default_enabled = match operation {
                    UserOnlyOperation::InviteCodeAccepted => true,
                };
                map.insert(operation.to_string(), is_default_enabled);
            }
        }

        map
    };
}

lazy_static! {
    // This is a list of all wallet notification types
    pub static ref WALLET_NOTIFICATION_DEFAULT_ENABLED: HashMap<String, bool> = {
        let mut map = HashMap::new();

        for notif in NOTIFICATION.iter() {
            if let Notification::WalletOnly(_, operation) = notif {
                let is_default_enabled = match operation {
                    WalletOnlyOperation::UserOperationCreated => true,
                    WalletOnlyOperation::UserOperationExecuted => true,
                    WalletOnlyOperation::TransactionWithUserOperationExecuted => true,
                };
                map.insert(operation.to_string(), is_default_enabled);
            }
        }

        map
    };
}

lazy_static! {
    // This is a list of all notification default enabled
    pub static ref NOTIFICATION_DEFAULT_ENABLED: HashMap<String, bool> = {
        let mut map = HashMap::new();

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
            if let Notification::UserOnly(_, operation) = notif {
                user_notification_keys.push(operation.to_string());
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
            if let Notification::WalletOnly(_, operation) = notif {
                wallet_notification_keys.push(operation.to_string());
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
    fn test_notification_keys() {
        for key in NOTIFICATION_KEYS.iter() {
            println!("{}", key);
        }
        insta::assert_snapshot!("NOTIFICATION_KEYS", format!("{:?}", *NOTIFICATION_KEYS));
    }

    #[test]
    fn test_notification_default_enabled() {
        insta::assert_snapshot!(
            "NOTIFICATION_DEFAULT_ENABLED",
            format!("{:?}", *NOTIFICATION_DEFAULT_ENABLED)
        );
    }
}
