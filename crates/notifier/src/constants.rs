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

use crate::types::{
    Notification, NotificationOperation, Platform, UserOnlyNotification, WalletOnlyNotification,
};
use lazy_static::lazy_static;
use std::collections::BTreeMap;
use strum::IntoEnumIterator;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

lazy_static! {
    // This is a list of all notification types
    pub static ref NOTIFICATIONS: Vec<Notification> = {
        let mut notifications= Vec::new();

        for operation in UserOnlyNotification::iter() {
            for platform in Platform::iter() {
                notifications.push(Notification::UserOnly(platform, operation.clone()));
            }
        }

        for operation in WalletOnlyNotification::iter() {
            for platform in Platform::iter() {
                notifications.push(Notification::WalletOnly(platform, operation.clone()));
            }
        }

        notifications
    };
}

lazy_static! {
    // This is a list of all notification operations
    pub static ref NOTIFICATION_OPERATIONS: Vec<NotificationOperation> = {
        let mut notification_operations = Vec::new();

        for notification_operation in UserOnlyNotification::iter() {
            notification_operations.push(NotificationOperation::UserOnly(notification_operation));
        }

        for notification_operation in WalletOnlyNotification::iter() {
            notification_operations.push(
                NotificationOperation::WalletOnly(notification_operation),
            );
        }

        notification_operations
    };
}

lazy_static! {
    // This is a list of all user notification types
    pub static ref USER_NOTIFICATION_DEFAULT_ENABLED: BTreeMap<String, bool> = {
        let mut map = BTreeMap::new();

        for notif in NOTIFICATIONS.iter() {
            if let Notification::UserOnly(_, operation) = notif {
                let is_default_enabled = match operation {
                    UserOnlyNotification::InviteCodeAccepted => true,
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

        for notif in NOTIFICATIONS.iter() {
            if let Notification::WalletOnly(_, operation) = notif {
                let is_default_enabled = match operation {
                    WalletOnlyNotification::UserOperationCreated => true,
                    WalletOnlyNotification::UserOperationExecuted => true,
                    WalletOnlyNotification::TransactionWithUserOperationExecuted => true,
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

        for notif in NOTIFICATIONS.iter() {
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

        for notif in NOTIFICATIONS.iter() {
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

        for notification in NOTIFICATIONS.iter() {
            notification_keys.push(notification.to_string());
        }

        notification_keys
    };
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

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
    fn test_notifications() {
        for notification in NOTIFICATIONS.iter() {
            println!("{}", notification);
        }
        insta::assert_snapshot!("NOTIFICATIONS", format!("{:?}", *NOTIFICATIONS));
    }

    #[test]
    fn test_notification_operations() {
        for operation in NOTIFICATION_OPERATIONS.iter() {
            println!("{}", operation);
        }
        insta::assert_snapshot!(
            "NOTIFICATION_OPERATIONS",
            format!("{:?}", *NOTIFICATION_OPERATIONS)
        );
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
