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

use crate::{
    config::NotifierArgs, types::NotificationOperation,
    utils::match_notification_operation_with_activity,
};
use clap::Parser;
use eyre::Result;
use lightdotso_discord::{config::DiscordArgs, discord::Discord};
use lightdotso_kafka::types::notification::NotificationMessage;
use lightdotso_prisma::{
    activity, notification, wallet_notification_settings, ActivityEntity, PrismaClient,
};
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Struct
// -----------------------------------------------------------------------------

#[derive(Clone)]
pub struct Notifier {
    pub discord: Discord,
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

impl Notifier {
    pub async fn new(_args: &NotifierArgs) -> Result<Self> {
        info!("Notifier new, starting");

        // Create the discord
        let discord = DiscordArgs::try_parse()
            .unwrap_or_else(|_| DiscordArgs::parse_from(["".to_string()]))
            .create()
            .await?;

        // Create the notifier
        Ok(Self { discord })
    }

    pub async fn run_with_activity(&self, activity: &activity::Data) -> Result<()> {
        // Get the activity entity
        match &activity.entity {
            ActivityEntity::Feedback => {
                // Log the feedback
                self.discord.notify_feedback(activity.log.clone()).await?;
            }
            ActivityEntity::UserOperation => {
                // Log the user operation
                self.discord.notify_user_operation(activity.log.clone()).await?;
            }
            ActivityEntity::Wallet => {
                // Log the wallet
                self.discord.notify_wallet(activity.log.clone()).await?;
            }
            _ => {}
        }

        Ok(())
    }

    pub async fn run_with_notification(
        &self,
        client: &PrismaClient,
        payload: &NotificationMessage,
    ) -> Result<()> {
        info!("Notifier run, starting");

        // Get the activity from the database
        let activity = client
            .activity()
            .find_unique(activity::id::equals(payload.clone().activity_id))
            .exec()
            .await?;

        // If the activity exists
        if let Some(activity) = activity {
            // Run the activity log notification
            self.discord.notify_activity(activity.log.clone()).await?;

            // Get the operation with the activity
            let notification_operation = match_notification_operation_with_activity(
                &activity.entity,
                &activity.operation,
                &activity.log,
            );
            info!("notification_operation: {:?}", notification_operation);

            // Match the notification operation
            match notification_operation {
                None => {}
                Some(NotificationOperation::UserOnly(_)) => {}
                Some(NotificationOperation::WalletOnly(opt)) => {
                    let key_id = opt.to_string();
                    info!("key_id: {:?}", key_id);

                    // If the user_id and wallet_address are present
                    if let Some(user_id) = payload.clone().user_id {
                        if let Some(wallet_address) = payload.clone().wallet_address {
                            // Get the wallet setting from the database
                            let wallet_notification_settings = client
                                .wallet_notification_settings()
                                .find_unique(wallet_notification_settings::user_id_wallet_address(
                                    user_id.clone(),
                                    wallet_address.clone(),
                                ))
                                .with(wallet_notification_settings::notification_settings::fetch(
                                    vec![],
                                ))
                                .exec()
                                .await?;

                            // If the wallet setting exists
                            if let Some(wallet_notification_settings) = wallet_notification_settings
                            {
                                // Match the key_id w/ the keys in the wallet setting
                                if let Some(notification_settings) =
                                    wallet_notification_settings.notification_settings
                                {
                                    if notification_settings
                                        .into_iter()
                                        .any(|data| data.key.contains(&key_id) && data.is_enabled)
                                    {
                                        // Create the notification
                                        client
                                            .notification()
                                            .create(vec![
                                                notification::activity_id::set(Some(
                                                    payload.clone().activity_id.clone(),
                                                )),
                                                notification::user_id::set(Some(user_id)),
                                                notification::wallet_address::set(Some(
                                                    wallet_address.clone(),
                                                )),
                                            ])
                                            .exec()
                                            .await?;
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
}
