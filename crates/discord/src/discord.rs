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
    channel::{
        ACTIVITY_CHANNEL_ID, FEEDBACK_CHANNEL_ID, NOTIFICATION_CHANNEL_ID, TEST_CHANNEL_ID,
        USER_OPERATION_CHANNEL_ID, WALLET_CHANNEL_ID,
    },
    config::DiscordArgs,
};
use eyre::{eyre, Result};
use lightdotso_tracing::tracing::info;
use serde_json::Value;
use serenity::all::{ChannelId, CreateAttachment, CreateEmbed, CreateMessage, Http};
use std::sync::Arc;

// -----------------------------------------------------------------------------
// Struct
// -----------------------------------------------------------------------------

#[derive(Clone)]
pub struct Discord {
    pub http: Arc<Http>,
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

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

    pub async fn notify(
        &self,
        channel_id: ChannelId,
        embed: CreateEmbed,
        file: Option<CreateAttachment>,
    ) -> Result<()> {
        // Create the message with the file if it exists
        let message = if let Some(file) = file {
            CreateMessage::new().embed(embed).add_file(file)
        } else {
            CreateMessage::new().embed(embed)
        };

        // Send the message
        channel_id.send_message(&self.http, message).await?;

        Ok(())
    }

    pub async fn notify_with_json(
        &self,
        channel_id: ChannelId,
        title: &str,
        content: &Value,
    ) -> Result<()> {
        // Serialize the content to a pretty-printed JSON string
        let json_content = serde_json::to_string_pretty(content)
            .map_err(|e| eyre!("Failed to serialize JSON: {}", e))?;

        // Create the embed with the title
        let mut embed = CreateEmbed::default().title(title).color(0x00ff00);

        // If content is small enough, add it to the embed
        if json_content.len() <= 4000 {
            embed = embed.description(format!("```json\n{}\n```", json_content));

            // Send the message
            self.notify(channel_id, embed, None).await?;
        } else {
            // If content is too large, attach it as a file
            let file_content = json_content.into_bytes();

            // Create the file
            let file = CreateAttachment::bytes(file_content, "content.json");

            // Send the message
            self.notify(channel_id, embed, Some(file)).await?;
        }

        Ok(())
    }

    pub async fn notify_create_wallet(
        &self,
        address: &str,
        chain_id: &str,
        transaction_hash: &str,
    ) -> Result<()> {
        // Create the embed
        let embed = CreateEmbed::new()
            .title("Wallet Created")
            .description(format!(
                "Address: {}\nChainid: {}\nHash: {}\n",
                address, chain_id, transaction_hash
            ))
            .color(0x00ff00);

        // Send the message
        self.notify(ChannelId::from(*NOTIFICATION_CHANNEL_ID), embed, None).await?;

        Ok(())
    }

    pub async fn notify_activity(&self, data: Value) -> Result<()> {
        info!("Discord notify_activity, starting");

        // Send the message
        self.notify_with_json(ChannelId::from(*ACTIVITY_CHANNEL_ID), "Activity", &data).await?;

        Ok(())
    }

    pub async fn notify_feedback(&self, data: Value) -> Result<()> {
        info!("Discord notify_feedback, starting");

        // Send the message
        self.notify_with_json(ChannelId::from(*FEEDBACK_CHANNEL_ID), "Feedback", &data).await?;

        Ok(())
    }

    pub async fn notify_test(&self, data: Value) -> Result<()> {
        info!("Discord notify_test, starting");

        // Send the message
        self.notify_with_json(ChannelId::from(*TEST_CHANNEL_ID), "Test", &data).await?;

        Ok(())
    }

    pub async fn notify_user_operation(&self, data: Value) -> Result<()> {
        info!("Discord notify_user_operation, starting");

        // Send the message
        self.notify_with_json(ChannelId::from(*USER_OPERATION_CHANNEL_ID), "User Operation", &data)
            .await?;

        Ok(())
    }

    pub async fn notify_wallet(&self, data: Value) -> Result<()> {
        info!("Discord notify_wallet, starting");

        // Send the message
        self.notify_with_json(ChannelId::from(*WALLET_CHANNEL_ID), "Wallet", &data).await?;

        Ok(())
    }
}
