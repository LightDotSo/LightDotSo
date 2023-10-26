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

use crate::polling::Polling;
use clap::Parser;
use eyre::Result;
use lightdotso_graphql::constants::THE_GRAPH_HOSTED_SERVICE_URLS;
use lightdotso_tracing::tracing::{error, info};

#[derive(Debug, Clone, Parser, Default)]
pub struct PollingArgs {
    /// The flag of whether polling is live.
    #[arg(long, short, default_value_t = true)]
    #[clap(long, env = "POLLING_LIVE")]
    pub live: bool,
    /// The polling mode to connect to.
    #[arg(long, short, default_value_t = String::from(""))]
    #[clap(long, env = "POLLING_MODE")]
    pub mode: String,
    /// The infura API key
    #[clap(long, env = "SATSUMA_API_KEY")]
    pub satsuma_api_key: Option<String>,
}

impl PollingArgs {
    #[tokio::main]
    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("PollingArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        // Get the chain ids from the constants which is the keys of the
        // THE_GRAPH_HOSTED_SERVICE_URLS map.
        let chain_ids: Vec<u64> = THE_GRAPH_HOSTED_SERVICE_URLS.keys().cloned().collect();

        // Create a vector to store the handles to the spawned tasks.
        let mut handles = Vec::new();

        // Spawn a task for each chain id.
        for chain_id in chain_ids {
            if self.live || self.mode == "all" {
                let live_handle = tokio::spawn(run_polling(self.clone(), chain_id, true));
                handles.push(live_handle);
            }

            if !self.live || self.mode == "all" {
                let past_handle = tokio::spawn(run_polling(self.clone(), chain_id, false));
                handles.push(past_handle);
            }
        }

        // Wait for all tasks to finish.
        for handle in handles {
            if let Err(e) = handle.await {
                error!("A task panicked: {:?}", e);
            }
        }

        Ok(())
    }
}

// Run the polling for a specific chain id.
pub async fn run_polling(args: PollingArgs, chain_id: u64, live: bool) {
    match live {
        true => {
            let polling = Polling::new(&args, chain_id, live).await;
            polling.run().await;
        }
        false => {
            loop {
                let polling = Polling::new(&args, chain_id, live).await;
                polling.run().await;

                // Sleep for 1 hour
                tokio::time::sleep(tokio::time::Duration::from_secs(60 * 60)).await;
            }
        }
    }
}
