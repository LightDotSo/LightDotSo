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
    config::NotifierArgs,
    types::{match_notification_with_activity, Operation},
};
use clap::Parser;
use eyre::Result;
use lightdotso_discord::{config::DiscordArgs, discord::Discord};
use lightdotso_kafka::types::notification::NotificationMessage;
use lightdotso_prisma::{
    activity, notification, wallet_notification_settings, ActivityEntity, PrismaClient,
};
use lightdotso_tracing::tracing::info;

#[derive(Clone)]
pub struct Notifier {
    pub discord: Discord,
}

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

    pub async fn run_with_db(
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
        if let Some(act) = activity {
            // Run the activity log notification
            self.discord.notify_activity(act.log.clone()).await?;

            // Run the user operation notification
            match &act.entity {
                ActivityEntity::UserOperation => {
                    self.discord.notify_user_operation(act.log.clone()).await?;
                }
                ActivityEntity::Transaction => {
                    // Log the transaction
                    info!("Transaction: {:?}", act.log);
                }
                _ => {}
            }

            // Get the operation with the activity
            let operation = match_notification_with_activity(&act.entity, &act.operation, &act.log);

            // Check if the notification should be sent or not
            if let Some(res) = operation {
                info!("res: {:?}", res);

                match res {
                    Operation::UserOnly(_) => {}
                    Operation::WalletOnly(opt) => {
                        let key_id = opt.to_string();
                        info!("key_id: {:?}", key_id);

                        // If the user_id and wallet_address are present
                        if let Some(user_id) = payload.clone().user_id {
                            if let Some(wallet_address) = payload.clone().wallet_address {
                                // Get the wallet setting from the database
                                let wallet_notification_settings = client
                                    .wallet_notification_settings()
                                    .find_unique(
                                        wallet_notification_settings::user_id_wallet_address(
                                            user_id.clone(),
                                            wallet_address.clone(),
                                        ),
                                    )
                                    .with(
                                        wallet_notification_settings::notification_settings::fetch(
                                            vec![],
                                        ),
                                    )
                                    .exec()
                                    .await?;

                                // If the wallet setting exists
                                if let Some(wallet_notification_settings) =
                                    wallet_notification_settings
                                {
                                    // Match the key_id w/ the keys in the wallet setting
                                    if let Some(notification_settings) =
                                        wallet_notification_settings.notification_settings
                                    {
                                        if notification_settings.into_iter().any(|data| {
                                            data.key.contains(&key_id) && data.is_enabled
                                        }) {
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
        }

        Ok(())
    }
}
