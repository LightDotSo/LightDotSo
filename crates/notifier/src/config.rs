// Copyright 2023-2024 Light
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

use crate::notifier::Notifier;
use clap::Parser;
use eyre::Result;
use lightdotso_tracing::tracing::info;

#[derive(Debug, Clone, Parser, Default)]
pub struct NotifierArgs {
    /// The webhook endpoint to connect to.
    #[clap(long, env = "DISCORD_WEBHOOK")]
    pub webhook: Option<String>,
}

impl NotifierArgs {
    pub async fn create(&self) -> Result<Notifier> {
        // Add info
        info!("NotifierArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        let notifier = Notifier::new(self).await;

        Ok(notifier)
    }
}
