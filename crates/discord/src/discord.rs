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

use crate::{channel::NOTIFICATION_CHANNEL_ID, config::DiscordArgs};
use eyre::{eyre, Result};
use lightdotso_tracing::tracing::info;
use serenity::all::{ChannelId, CreateEmbed, CreateMessage, Http};
use std::sync::Arc;

#[derive(Clone)]
pub struct Discord {
    pub http: Arc<Http>,
}

impl Discord {
    pub async fn new(args: &DiscordArgs) -> Result<Self> {
        info!("Discord new, starting");

        // Get the token
        let token = args.token.clone().ok_or_else(|| eyre!("DISCORD_TOKEN is not set"))?;

        // Create the discord client
        let http = Http::new(&token);

        // Create the discord
        Ok(Self { http: Arc::new(http) })
    }

    pub async fn notify(&self, channel_id: ChannelId, embed: CreateEmbed) -> Result<()> {
        let message = CreateMessage::new().embed(embed);
        channel_id.send_message(&self.http, message).await?;

        Ok(())
    }

    pub async fn notify_create_wallet(
        &self,
        address: &str,
        chain_id: &str,
        transaction_hash: &str,
    ) -> Result<()> {
        let embed = CreateEmbed::new()
            .title("Wallet Created")
            .description(format!(
                "Address: {}\nChainid: {}\nHash: {}\n",
                address, chain_id, transaction_hash
            ))
            .color(0x00ff00);

        self.notify(ChannelId::from(*NOTIFICATION_CHANNEL_ID), embed).await?;

        Ok(())
    }
}
