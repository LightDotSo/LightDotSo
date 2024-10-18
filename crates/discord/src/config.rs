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

use crate::discord::Discord;
use clap::Parser;
use eyre::Result;
use lightdotso_tracing::tracing::info;

#[derive(Clone, Debug, Parser, Default)]
pub struct DiscordArgs {
    /// The discord token to connect to.
    #[clap(long, env = "DISCORD_TOKEN")]
    pub token: String,
}

impl DiscordArgs {
    pub async fn create(&self) -> Result<Discord> {
        // Add info
        info!("DiscordArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        let discord = Discord::new(self).await;

        Ok(discord)
    }
}
