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

use serenity::{
    http::Http,
    json::Value,
    model::{channel::Embed, webhook::Webhook},
};

pub async fn notify(webhook: &str, content: Value) {
    // You don't need a token when you are only dealing with webhooks.
    let http = Http::new("");
    let webhook =
        Webhook::from_url(&http, webhook).await.expect("Replace the webhook with your own");

    webhook
        .execute(&http, false, |w| {
            w.content(content).username("LightDotSo").avatar_url("https://assets.light.so/icon.png")
        })
        .await
        .expect("Could not execute webhook.");
}

pub async fn notify_create_wallet(
    webhook: &str,
    address: &str,
    chain_id: &str,
    transaction_hash: &str,
) {
    let embed = Embed::fake(|e| {
        e.title("Wallet Created")
            .description(format!(
                "Address: {}\nChainid: {}\nHash: {}\n",
                address, chain_id, transaction_hash
            ))
            .color(0x00ff00)
    });

    notify(webhook, embed).await;
}
