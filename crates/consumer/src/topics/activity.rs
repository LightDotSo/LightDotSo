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

use eyre::{eyre, Result};
use lightdotso_db::models::activity::create_activity_with_user_and_wallet;
use lightdotso_kafka::{
    topics::notification::produce_notification_message,
    types::{activity::ActivityMessage, notification::NotificationMessage},
};
use lightdotso_notifier::types::{match_notification_with_activity, Operation};
use lightdotso_prisma::{configuration, owner, ActivityEntity, ActivityOperation, PrismaClient};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use rdkafka::{message::BorrowedMessage, producer::FutureProducer, Message};
use std::sync::Arc;

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

pub trait FromStrExt: Sized {
    fn from_str_ext(s: &str) -> Result<Self>;
}

impl FromStrExt for ActivityEntity {
    fn from_str_ext(s: &str) -> Result<Self> {
        match s {
            "USER" => Ok(Self::User),
            "WALLET" => Ok(Self::Wallet),
            "INVITE_CODE" => Ok(Self::InviteCode),
            "SUPPORT_REQUEST" => Ok(Self::SupportRequest),
            "WALLET_SETTINGS" => Ok(Self::WalletSettings),
            "FEEDBACK" => Ok(Self::Feedback),
            "NOTIFICATION" => Ok(Self::Notification),
            "SIGNATURE" => Ok(Self::Signature),
            "SIMULATION" => Ok(Self::Simulation),
            "TRANSACTION" => Ok(Self::Transaction),
            "USER_OPERATION" => Ok(Self::UserOperation),
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

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub async fn activity_consumer(
    producer: Arc<FutureProducer>,
    msg: &BorrowedMessage<'_>,
    db: Arc<PrismaClient>,
) -> Result<()> {
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
            let payload: ActivityMessage = serde_json::from_slice(payload.as_bytes())?;

            // Create activity with user and wallet
            let act = create_activity_with_user_and_wallet(
                db.clone(),
                entity,
                payload.operation,
                payload.log.clone(),
                payload.params,
            )
            .await?;
            info!("act: {:?}", act.clone());

            let res = match_notification_with_activity(&entity, &payload.operation, &payload.log);

            if let Some(res) = res {
                info!("res: {:?}", res);

                match res {
                    Operation::UserOnly(_) => {
                        // let notification = NotificationMessage {
                        //     user_id: act.user_id,
                        //     activity_id: act.id,
                        //     entity: entity.to_string(),
                        //     operation: payload.operation.to_string(),
                        //     log: payload.log,
                        // };

                        // produce_notification_message(producer, &notification).await?;
                    }
                    Operation::WalletOnly(opt) => {
                        let key_id = opt.to_string();
                        info!("key_id: {:?}", key_id);

                        if let Some(wallet_address) = &act.wallet_address {
                            // Get the owners of the wallet
                            let config = db
                                .clone()
                                .configuration()
                                .find_first(vec![configuration::address::equals(
                                    wallet_address.to_string(),
                                )])
                                .order_by(configuration::checkpoint::order(Direction::Desc))
                                .with(
                                    configuration::owners::fetch(vec![]).with(owner::user::fetch()),
                                )
                                .exec()
                                .await?;
                            info!("config: {:?}", config.clone());

                            if let Some(configuration) = config {
                                // Get the configuration of the wallet
                                if let Some(owners) = configuration.owners {
                                    // For each owner of the wallet
                                    for owner in owners {
                                        // Construct the notification
                                        let notification = NotificationMessage {
                                            key: key_id.clone(),
                                            activity_id: act.id.clone(),
                                            user_id: owner.user_id,
                                            wallet_address: Some(wallet_address.to_string()),
                                        };
                                        info!("notification: {:?}", notification.clone());

                                        // Send the notification
                                        produce_notification_message(
                                            producer.clone(),
                                            &notification,
                                        )
                                        .await?;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(())
}
