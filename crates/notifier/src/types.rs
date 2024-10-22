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

use strum_macros::{Display, EnumIter, EnumString, IntoStaticStr};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// This is a list of all platforms
#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display, PartialEq)]
pub enum Platform {
    #[strum(serialize = "WEB")]
    Web,
}

// This is a list of all user notifications
#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display, PartialEq)]
pub enum UserOnlyNotification {
    #[strum(serialize = "INVITE_CODE_ACCEPTED")]
    InviteCodeAccepted,
}

// This is a list of all wallet notification operations
#[derive(Clone, Debug, EnumString, EnumIter, IntoStaticStr, Display, PartialEq)]
pub enum WalletOnlyNotification {
    #[strum(serialize = "USER_OPERATION_CREATED")]
    UserOperationCreated,
    #[strum(serialize = "USER_OPERATION_EXECUTED")]
    UserOperationExecuted,
    #[strum(serialize = "TRANSACTION_WITH_USER_OPERATION_EXECUTED")]
    TransactionWithUserOperationExecuted,
}

// For each operation, we define a notification type which is all combinations of operation and
// platform
#[derive(Clone, Debug, PartialEq)]
pub enum Notification {
    UserOnly(Platform, UserOnlyNotification),
    WalletOnly(Platform, WalletOnlyNotification),
}

// Implement Display for Notification
impl std::fmt::Display for Notification {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Notification::UserOnly(platform, operation) => {
                write!(f, "{}:::{}", platform, operation)
            }
            Notification::WalletOnly(platform, operation) => {
                write!(f, "{}:::{}", platform, operation)
            }
        }
    }
}

// This is a list of all notification operations
#[derive(Clone, Debug, Display, PartialEq)]
pub enum NotificationOperation {
    UserOnly(UserOnlyNotification),
    WalletOnly(WalletOnlyNotification),
}
