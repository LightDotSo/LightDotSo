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
            notify_create_wallet(
                webhook,
                "&to_checksum(address, None)",
                "&self.chain_id.to_string()",
                "&tx_hash.to_string()",
            )
            .await;
        }
    }
}
