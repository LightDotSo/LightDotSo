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

use crate::config::PollingArgs;
use backon::BlockingRetryable;
use backon::ExponentialBuilder;
use lightdotso_graphql::polling::light_wallets::run_query;
use lightdotso_tracing::tracing::error;
use lightdotso_tracing::tracing::info;
use std::time::Duration;

#[derive(Clone)]
pub struct Polling {}

impl Polling {
    pub async fn new(_args: &PollingArgs) -> Self {
        info!("Polling new, starting");

        // Create the polling
        Self {}
    }

    pub async fn run(&self) {
        info!("Polling run, starting");

        let mut handles = Vec::new();

        for index in 0..12 {
            let handle = tokio::spawn(run_polling_task(index));
            handles.push(handle);
        }

        for handle in handles {
            if let Err(e) = handle.await {
                error!("A task panicked: {:?}", e);
            }
        }
    }
}

async fn run_polling_task(chain_id: u64) {
    loop {
        // Wrap the task in a catch_unwind block to not crash the task if the task panics.
        let result = std::panic::catch_unwind(|| async {
            // Get the light wallet data
            let light_wallet =
                { || run_query(1, "0") }.retry(&ExponentialBuilder::default()).call();
            // Log the light wallet data
            info!("light_wallet: {:?}", light_wallet.unwrap());
        });

        match result {
            Ok(_) => {
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;

                let now = chrono::Utc::now();
                // if now.minute() == 0 {
                info!("Polling run, chain_id: {} timestamp: {}", chain_id, now);
                // }
            }
            Err(e) => {
                error!("run_task {} panicked: {:?}", chain_id, e);
                // Retry the task after 1 second.
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
        }
    }
}
