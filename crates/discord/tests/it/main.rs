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

#![recursion_limit = "512"]

use clap::Parser;
use dotenvy::dotenv;
use eyre::Result;
use lightdotso_discord::config::DiscordArgs;

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_notify() -> Result<()> {
    // Load the environment variables
    let _ = dotenv();

    // Create the discord
    let discord = DiscordArgs::parse_from([""]).create().await?;

    // Notify
    discord.notify_create_wallet("test", "test", "test").await?;

    Ok(())
}

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_notify_test() -> Result<()> {
    // Load the environment variables
    let _ = dotenv();

    // Create the discord
    let discord = DiscordArgs::parse_from([""]).create().await?;

    // Create a json
    let json_content = serde_json::json!({ "test": "test" });

    // Notify
    discord.notify_test(json_content).await?;

    Ok(())
}

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_notify_test_large_json() -> Result<()> {
    // Load the environment variables
    let _ = dotenv();

    // Create the discord
    let discord = DiscordArgs::parse_from([""]).create().await?;

    // Create a large json over 4000 characters
    let json_content = "test".repeat(4000);

    // Notify
    discord.notify_test(serde_json::json!({ "test": json_content })).await?;

    Ok(())
}
