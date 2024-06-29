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

use crate::config::NotifierArgs;

// use backon::{ExponentialBuilder, Retryable};
use lightdotso_discord::notify_create_wallet;
use lightdotso_tracing::tracing::info;

#[derive(Clone)]
pub struct Notifier {
    webhook: Option<String>,
}

impl Notifier {
    pub async fn new(args: &NotifierArgs) -> Self {
        info!("Notifier new, starting");

        // Create the notifier
        Self { webhook: args.webhook.clone() }
    }

    pub async fn run(&self) {
        info!("Notifier run, starting");

        if let Some(webhook) = &self.webhook {
            let _ = notify_create_wallet(
                webhook,
                "&to_checksum(address, None)",
                "&self.chain_id.to_string()",
                "&tx_hash.to_string()",
            )
            .await;
        }
    }
}
