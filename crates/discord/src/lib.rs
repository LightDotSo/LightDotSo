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

use eyre::Result;
use serenity::{
    all::{CreateEmbed, ExecuteWebhook},
    http::Http,
    model::webhook::Webhook,
};

pub async fn notify(webhook: &str, embed: CreateEmbed) -> Result<()> {
    // You don't need a token when you are only dealing with webhooks.
    let http = Http::new("");
    let webhook = Webhook::from_url(&http, webhook).await?;
    let builder = ExecuteWebhook::new()
        .username("LightDotSo")
        .avatar_url("https://assets.light.so/icon.png")
        .embed(embed);

    webhook.execute(&http, false, builder).await?;

    Ok(())
}

pub async fn notify_create_wallet(
    webhook: &str,
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

    notify(webhook, embed).await?;

    Ok(())
}
