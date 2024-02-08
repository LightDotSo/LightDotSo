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

#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display)]
pub enum Platform {
    #[strum(serialize = "WEB")]
    Web,
}

#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display)]
pub enum UserOnlyOperation {
    #[strum(serialize = "invite-code-accepted")]
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

#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display)]
pub enum WalletOnlyOperation {
    #[strum(serialize = "user-operation-created")]
    UserOperationCreated,
    #[strum(serialize = "user-operation-executed")]
    UserOperationExecuted,
    #[strum(serialize = "transaction-with-user-operation-executed")]
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
            Some(WalletOnlyOperation::UserOperationExecuted)
        }
        (ActivityEntity::Transaction, ActivityOperation::Update) => {
            if log["status"].as_str() == Some("EXECUTED") ||
                log["status"].as_str() == Some("REVERTED")
            {
                Some(WalletOnlyOperation::TransactionWithUserOperationExecuted)
            } else {
                None
            }
        }
        _ => None,
    }
}

#[derive(Clone, Debug, Display)]
pub enum Operation {
    UserOnly(UserOnlyOperation),
    WalletOnly(WalletOnlyOperation),
}

lazy_static! {
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
    pub static ref NOTIFICATION_DEFAULT_ENABLED: HashMap<String, bool> = {
        let mut map = HashMap::new();

        for notif in NOTIFICATION.iter() {
            let is_default_enabled = match notif {
                Notification::UserOnly(_, operation) => match operation {
                    UserOnlyOperation::InviteCodeAccepted => true,
                },
                Notification::WalletOnly(_, operation) => match operation {
                    WalletOnlyOperation::UserOperationCreated => false,
                    WalletOnlyOperation::UserOperationExecuted => true,
                    WalletOnlyOperation::TransactionWithUserOperationExecuted => true,
                },
            };
            map.insert(notif.to_string(), is_default_enabled);
        }

        map
    };
}

lazy_static! {
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
    }

    #[test]
    fn test_notification_default_enabled() {
        println!("{:?}", *NOTIFICATION_DEFAULT_ENABLED);
    }
}
