// Copyright 2023-2024 Light.
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
    http::Http,
    json::Value,
    model::{channel::Embed, webhook::Webhook},
};

pub async fn notify(webhook: &str, content: Value) -> Result<()> {
    // You don't need a token when you are only dealing with webhooks.
    let http = Http::new("");
    let webhook = Webhook::from_url(&http, webhook).await?;

    webhook
        .execute(&http, false, |w| {
            w.content(content).username("LightDotSo").avatar_url("https://assets.light.so/icon.png")
        })
        .await?;

    Ok(())
}

pub async fn notify_create_wallet(
    webhook: &str,
    address: &str,
    chain_id: &str,
    transaction_hash: &str,
) -> Result<()> {
    let embed = Embed::fake(|e| {
        e.title("Wallet Created")
            .description(format!(
                "Address: {}\nChainid: {}\nHash: {}\n",
                address, chain_id, transaction_hash
            ))
            .color(0x00ff00)
    });

    notify(webhook, embed).await?;

    Ok(())
}
