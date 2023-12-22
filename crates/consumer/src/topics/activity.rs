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

#![allow(clippy::unwrap_used)]

use eyre::{eyre, Result};
use lightdotso_db::models::activity::{create_activity_with_user_and_wallet, CustomParams};
use lightdotso_prisma::{ActivityEntity, ActivityOperation, PrismaClient};
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use serde_json::Value;
use std::sync::Arc;

pub trait FromStrExt: Sized {
    fn from_str_ext(s: &str) -> Result<Self>;
}

impl FromStrExt for ActivityEntity {
    fn from_str_ext(s: &str) -> Result<Self> {
        match s {
            "WALLET" => Ok(Self::Wallet),
            "USER" => Ok(Self::User),
            "INVITE_CODE" => Ok(Self::InviteCode),
            "SUPPORT_REQUEST" => Ok(Self::SupportRequest),
            "WALLET_SETTINGS" => Ok(Self::WalletSettings),
            "FEEDBACK" => Ok(Self::Feedback),
            "NOTIFICATION" => Ok(Self::Notification),
            "USER_OPERATION" => Ok(Self::UserOperation),
            "TRANSACTION" => Ok(Self::Transaction),
            _ => Err(eyre!("no match for input string")),
        }
    }
}

impl FromStrExt for ActivityOperation {
    fn from_str_ext(s: &str) -> Result<Self> {
        match s {
            "CREATE" => Ok(Self::Create),
            "UPDATE" => Ok(Self::Update),
            "DELETE" => Ok(Self::Delete),
            _ => Err(eyre!("no match for input string")),
        }
    }
}

pub async fn activity_consumer(msg: &BorrowedMessage<'_>, db: Arc<PrismaClient>) -> Result<()> {
    // Send webhook if exists
    info!(
        "key: '{:?}', payload: '{:?}',  topic: {}, partition: {}, offset: {}, timestamp: {:?}",
        msg.key(),
        msg.payload_view::<str>(),
        msg.topic(),
        msg.partition(),
        msg.offset(),
        msg.timestamp()
    );

    // Convert the key to a string
    let key = msg.key_view::<str>();

    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the key is not empty, then we can parse it
    if let Some(Ok(key)) = key {
        let entity = ActivityEntity::from_str_ext(key)?;

        // If the payload is valid
        if let Some(Ok(payload)) = payload_opt {
            // Try to deserialize the payload as json
            let payload: Value = serde_json::from_slice(payload.as_bytes())?;

            // If there is an operation field, try to parse it as ActivityOperation
            if let Some(operation) = payload.get("operation") {
                // Try to parse the operation as ActivityOperation
                let operation = ActivityOperation::from_str_ext(operation.as_str().unwrap())?;

                // Try to parse the log as Value, if error, then set it to null
                let log = match payload.get("log") {
                    Some(log) => log,
                    None => return Err(eyre!("log field is required")),
                };

                // Try to parse the `user_id` as String, if error, then set it to None
                let user_id =
                    payload.get("user_id").map(|user_id| user_id.as_str().unwrap().to_string());

                // Try to parse the `wallet_address` as String, if error, then set it to None
                let wallet_address = payload
                    .get("wallet_address")
                    .map(|wallet_address| wallet_address.as_str().unwrap().to_string());

                // Try to parse the `invite_code_id` as String, if error, then set it to None
                let invite_code_id = payload
                    .get("invite_code_id")
                    .map(|invite_code_id| invite_code_id.as_str().unwrap().to_string());

                // Try to parse the `support_request_id` as String, if error, then set it to None
                let support_request_id = payload
                    .get("support_request_id")
                    .map(|support_request_id| support_request_id.as_str().unwrap().to_string());

                // Try to parse the `wallet_settings_id` as String, if error, then set it to None
                let wallet_settings_id = payload
                    .get("wallet_settings_id")
                    .map(|wallet_settings_id| wallet_settings_id.as_str().unwrap().to_string());

                // Try to parse the `feedback_id` as String, if error, then set it to None
                let feedback_id = payload
                    .get("feedback_id")
                    .map(|feedback_id| feedback_id.as_str().unwrap().to_string());

                // Try to parse the `notification_id` as String, if error, then set it to None
                let notification_id = payload
                    .get("notification_id")
                    .map(|notification_id| notification_id.as_str().unwrap().to_string());

                // Try to parse the `user_operation_hash` as String, if error, then set it to None
                let user_operation_hash = payload
                    .get("user_operation_hash")
                    .map(|user_operation_hash| user_operation_hash.as_str().unwrap().to_string());

                // Try to parse the `transaction_hash` as String, if error, then set it to None
                let transaction_hash = payload
                    .get("transaction_hash")
                    .map(|transaction_hash| transaction_hash.as_str().unwrap().to_string());

                // Create custom params
                let custom_params = CustomParams {
                    invite_code_id,
                    support_request_id,
                    wallet_settings_id,
                    feedback_id,
                    notification_id,
                    user_operation_hash,
                    transaction_hash,
                };

                // Create activity with user and wallet
                let _ = create_activity_with_user_and_wallet(
                    db,
                    entity,
                    operation,
                    log.clone(),
                    user_id,
                    wallet_address,
                    custom_params,
                )
                .await;
            }
        }
    }

    Ok(())
}
