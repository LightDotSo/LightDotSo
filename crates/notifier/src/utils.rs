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

use crate::types::{NotificationOperation, UserOnlyNotification, WalletOnlyNotification};
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use serde_json::Value;

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

// Utility function to match the activity entity/operation combination
pub fn match_user_only_notification_with_activity(
    entity: &ActivityEntity,
    operation: &ActivityOperation,
    log: &Value,
) -> Option<UserOnlyNotification> {
    match (entity, operation) {
        (ActivityEntity::InviteCode, ActivityOperation::Update) => {
            // Check if the key of log is status is `USED`
            if log["status"].as_str() == Some("USED") {
                Some(UserOnlyNotification::InviteCodeAccepted)
            } else {
                None
            }
        }
        _ => None,
    }
}

// Utility function to match the activity entity/operation combination
pub fn match_wallet_only_notification_with_activity(
    entity: &ActivityEntity,
    operation: &ActivityOperation,
    log: &Value,
) -> Option<WalletOnlyNotification> {
    match (entity, operation) {
        (ActivityEntity::UserOperation, ActivityOperation::Create) => {
            Some(WalletOnlyNotification::UserOperationCreated)
        }
        (ActivityEntity::UserOperation, ActivityOperation::Update) => {
            if log["status"].as_str() == Some("EXECUTED") ||
                log["status"].as_str() == Some("REVERTED")
            {
                Some(WalletOnlyNotification::TransactionWithUserOperationExecuted)
            } else {
                None
            }
        }
        (ActivityEntity::Transaction, ActivityOperation::Update) => None,
        _ => None,
    }
}

// Combination utility function to match the activity entity/operation combination
pub fn match_notification_operation_with_activity(
    entity: &ActivityEntity,
    operation: &ActivityOperation,
    log: &Value,
) -> Option<NotificationOperation> {
    if let Some(res) = match_user_only_notification_with_activity(entity, operation, log) {
        return Some(NotificationOperation::UserOnly(res));
    }

    match_wallet_only_notification_with_activity(entity, operation, log)
        .map(NotificationOperation::WalletOnly)
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn test_match_user_only_notification_with_activity() {
        let entity = ActivityEntity::InviteCode;
        let operation = ActivityOperation::Update;
        let log = serde_json::Value::from_str(r#"{"status": "USED"}"#).unwrap();
        let result = match_user_only_notification_with_activity(&entity, &operation, &log);
        assert_eq!(result, Some(UserOnlyNotification::InviteCodeAccepted));
    }

    #[test]
    fn test_match_wallet_only_notification_with_activity() {
        let entity = ActivityEntity::UserOperation;
        let operation = ActivityOperation::Create;
        let result =
            match_wallet_only_notification_with_activity(&entity, &operation, &Value::Null);
        assert_eq!(result, Some(WalletOnlyNotification::UserOperationCreated));
    }

    #[test]
    fn test_match_notification_operation_with_activity() {
        let entity = ActivityEntity::UserOperation;
        let operation = ActivityOperation::Create;
        let result = match_notification_operation_with_activity(&entity, &operation, &Value::Null);
        assert_eq!(
            result,
            Some(NotificationOperation::WalletOnly(WalletOnlyNotification::UserOperationCreated))
        );
    }
}
