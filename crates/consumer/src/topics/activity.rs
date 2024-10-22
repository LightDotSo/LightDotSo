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

use super::TopicConsumer;
use crate::state::ConsumerState;
use async_trait::async_trait;
use eyre::{eyre, Result};
use lightdotso_db::models::activity::create_activity_with_user_and_wallet;
use lightdotso_kafka::{
    topics::notification::produce_notification_message,
    types::{activity::ActivityMessage, notification::NotificationMessage},
};
use lightdotso_notifier::{
    types::NotificationOperation, utils::match_notification_operation_with_activity,
};
use lightdotso_prisma::{configuration, owner, ActivityEntity, ActivityOperation};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use rdkafka::{message::BorrowedMessage, Message};

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

pub trait FromStrExt: Sized {
    fn from_str_ext(s: &str) -> Result<Self>;
}

impl FromStrExt for ActivityEntity {
    fn from_str_ext(s: &str) -> Result<Self> {
        match s {
            // Core + Relations None-to-many
            "USER" => Ok(Self::User),
            "WALLET" => Ok(Self::Wallet),
            "TIMELOCK" => Ok(Self::Timelock),
            // Mutable + Relations None-to-many
            "BILLING" => Ok(Self::Billing),
            "BILLING_OPERATION" => Ok(Self::BillingOperation),
            "CONFIGURATION_OPERATION" => Ok(Self::ConfigurationOperation),
            "INVITE_CODE" => Ok(Self::InviteCode),
            "SUPPORT_REQUEST" => Ok(Self::SupportRequest),
            "TIMELOCK_OPERATION" => Ok(Self::TimelockOperation),
            "USER_SETTINGS" => Ok(Self::UserSettings),
            "USER_NOTIFICATION_SETTINGS" => Ok(Self::UserNotificationSettings),
            "WALLET_BILLING" => Ok(Self::WalletBilling),
            // "WALLET_FEATURES" => Ok(Self::WalletFeatures),
            "WALLET_NOTIFICATION_SETTINGS" => Ok(Self::WalletNotificationSettings),
            "WALLET_SETTINGS" => Ok(Self::WalletSettings),
            // Immutable Relations None-to-none
            "CONFIGURATION_OPERATION_SIGNATURE" => Ok(Self::ConfigurationOperationSignature),
            "FEEDBACK" => Ok(Self::Feedback),
            "NOTIFICATION" => Ok(Self::Notification),
            "PAYMASTER" => Ok(Self::Paymaster),
            "PAYMASTER_OPERATION" => Ok(Self::PaymasterOperation),
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

pub struct ActivityConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for ActivityConsumer {
    async fn consume(
        &self,
        state: &ClientState,
        consumer_state: Option<&ConsumerState>,
        msg: &BorrowedMessage<'_>,
    ) -> Result<()> {
        // Since we use consumer_state, we need to unwrap it
        let consumer_state = consumer_state.ok_or_else(|| eyre!("Consumer state is None"))?;

        // Convert the payload to a string
        let payload_opt = msg.payload_view::<str>();
        info!("payload_opt: {:?}", payload_opt);
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
                info!("payload: {:?}", payload);

                // Consume the payload
                self.consume_with_message(state, consumer_state, entity, payload).await?;
            }
        }

        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

impl ActivityConsumer {
    pub async fn consume_with_message(
        &self,
        state: &ClientState,
        consumer_state: &ConsumerState,
        entity: ActivityEntity,
        payload: ActivityMessage,
    ) -> Result<()> {
        // Create activity with user and wallet
        let activity = create_activity_with_user_and_wallet(
            state.client.clone(),
            entity,
            payload.operation,
            payload.log.clone(),
            payload.params,
        )
        .await?;
        info!("activity: {:?}", activity.clone());

        // Get the notification
        let notification_operation =
            match_notification_operation_with_activity(&entity, &payload.operation, &payload.log);
        info!("notification_operation: {:?}", notification_operation);

        match notification_operation {
            None => {}
            Some(NotificationOperation::UserOnly(nfo)) => {
                // Get the key id
                let key_id = nfo.to_string();
                info!("NotificationOperation::UserOnly key_id: {:?}", key_id);

                let notification = NotificationMessage {
                    key: key_id.clone(),
                    user_id: activity.user_id.clone(),
                    activity_id: activity.id.clone(),
                    wallet_address: None,
                };
                info!("notification: {:?}", notification.clone());

                produce_notification_message(state.producer.clone(), &notification).await?;
            }
            Some(NotificationOperation::WalletOnly(nfo)) => {
                let key_id = nfo.to_string();
                info!("NotificationOperation::WalletOnly key_id: {:?}", key_id);

                if let Some(wallet_address) = &activity.wallet_address {
                    // Get the owners of the wallet
                    let config = state
                        .client
                        .clone()
                        .configuration()
                        .find_first(vec![configuration::address::equals(
                            wallet_address.to_string(),
                        )])
                        .order_by(configuration::checkpoint::order(Direction::Desc))
                        .with(configuration::owners::fetch(vec![]).with(owner::user::fetch()))
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
                                    activity_id: activity.id.clone(),
                                    user_id: owner.user_id,
                                    wallet_address: Some(wallet_address.to_string()),
                                };
                                info!("notification: {:?}", notification.clone());

                                produce_notification_message(state.producer.clone(), &notification)
                                    .await?;
                            }
                        }
                    }
                }
            }
        }

        // Finally, notify activity
        consumer_state.notifier.run_with_activity(&activity.0).await?;

        Ok(())
    }
}
