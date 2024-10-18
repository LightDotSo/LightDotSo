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

use crate::config::DiscordArgs;
use eyre::Result;
use lightdotso_tracing::tracing::info;
use serenity::{
    all::{ChannelId, CreateEmbed, CreateMessage},
    prelude::*,
};

#[derive(Clone)]
pub struct Discord {
    pub token: String,
}

impl Discord {
    pub async fn new(args: &DiscordArgs) -> Self {
        info!("Discord new, starting");

        // Create the discord
        Self { token: args.token.clone() }
    }

    pub async fn notify(
        &self,
        ctx: &Context,
        channel_id: ChannelId,
        embed: CreateEmbed,
    ) -> Result<()> {
        let message = CreateMessage::new().embed(embed);
        channel_id.send_message(&ctx.http, message).await?;

        Ok(())
    }

    pub async fn notify_create_wallet(
        &self,
        ctx: &Context,
        channel_id: ChannelId,
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

        self.notify(ctx, channel_id, embed).await?;

        Ok(())
    }
}
