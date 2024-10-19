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

use crate::config::NotifierArgs;
use clap::Parser;
use eyre::Result;
// use backon::{ExponentialBuilder, Retryable};
use lightdotso_discord::{config::DiscordArgs, discord::Discord};
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

    pub async fn run(&self) {
        info!("Notifier run, starting");
    }
}
