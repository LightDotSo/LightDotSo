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
pub struct PollingArgs {}

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
            let handle = tokio::spawn(run_polling(self.clone(), chain_id));
            handles.push(handle);
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
pub async fn run_polling(args: PollingArgs, chain_id: u64) {
    let polling = Polling::new(&args, chain_id).await;
    polling.run().await;
}
