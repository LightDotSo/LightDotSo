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

#![allow(clippy::unwrap_used)]

use crate::{
    constants::{SATSUMA, STUDIO},
    polling::Polling,
};
use clap::Parser;
use eyre::Result;
use lightdotso_constants::chains::CHAIN_BLOCK_SECONDS;
use lightdotso_graphql::constants::{
    SATSUMA_BASE_URL, SATSUMA_LIVE_IDS, THE_GRAPH_STUDIO_BASE_URL, THE_GRAPH_STUDIO_SERVICE_IDS,
};
use lightdotso_tracing::tracing::{error, info};
use std::collections::HashMap;

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
    /// The the graph studio API key
    #[clap(long, env = "THE_GRAPH_STUDIO_API_KEY")]
    pub the_graph_studio_api_key: Option<String>,
    /// The satsuma API key
    #[clap(long, env = "SATSUMA_API_KEY")]
    pub satsuma_api_key: Option<String>,
    /// The flag of whether polling is live for the graph studio.
    #[arg(long, short, default_value_t = false)]
    #[clap(long, env = "THE_GRAPH_STUDIO_ENABLED")]
    pub the_graph_studio_enabled: bool,
    /// The flag of whether polling is live for satsuma.
    #[arg(long, short, default_value_t = false)]
    #[clap(long, env = "SATSUMA_ENABLED")]
    pub satsuma_enabled: bool,
}

impl PollingArgs {
    pub async fn create(&self) -> Result<Polling> {
        // Create a mapping of sleep seconds for each chain id
        let sleep_seconds_mapping = create_sleep_seconds_mapping();

        // Create a mapping for chain id to polling URLs.
        let chain_mapping = create_chain_mapping(
            self.the_graph_studio_api_key.clone(),
            self.the_graph_studio_enabled,
            self.satsuma_api_key.clone(),
            self.satsuma_enabled,
        );

        Polling::new(&PollingArgs::default(), sleep_seconds_mapping, chain_mapping, true).await
    }

    #[tokio::main]
    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("PollingArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        // Create a mapping for chain id to polling URLs.
        let chain_mapping = create_chain_mapping(
            self.the_graph_studio_api_key.clone(),
            self.the_graph_studio_enabled,
            self.satsuma_api_key.clone(),
            self.satsuma_enabled,
        );

        // Create a vector to store the handles to the spawned tasks.
        let mut handles = Vec::new();

        // Spawn a task for each chain id.
        for (chain_id, chain_map) in chain_mapping.clone().into_iter() {
            for (service, _url) in chain_map.into_iter() {
                if self.live || self.mode == "all" {
                    let live_handle = tokio::spawn(run_polling(
                        self.clone(),
                        chain_id,
                        service.clone(),
                        true,
                        chain_mapping.clone(),
                    ));
                    handles.push(live_handle);
                }

                if !self.live || self.mode == "all" {
                    let past_handle = tokio::spawn(run_polling(
                        self.clone(),
                        chain_id,
                        service.clone(),
                        false,
                        chain_mapping.clone(),
                    ));
                    handles.push(past_handle);
                }
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
pub async fn run_polling(
    args: PollingArgs,
    chain_id: u64,
    service_provider: String,
    live: bool,
    chain_mapping: HashMap<u64, HashMap<String, String>>,
) -> Result<()> {
    // Create a mapping of sleep seconds for each chain id
    let sleep_seconds_mapping = create_sleep_seconds_mapping();

    match live {
        true => {
            let polling =
                Polling::new(&args, sleep_seconds_mapping.clone(), chain_mapping.clone(), live)
                    .await?;
            polling.run(chain_id, service_provider.clone()).await;
        }
        false => {
            loop {
                let polling =
                    Polling::new(&args, sleep_seconds_mapping.clone(), chain_mapping.clone(), live)
                        .await?;
                polling.run(chain_id, service_provider.clone()).await;

                // Sleep for 1 hour
                tokio::time::sleep(tokio::time::Duration::from_secs(60 * 60)).await;
            }
        }
    }

    Ok(())
}

/// Create a mapping of sleep seconds for each chain id.
pub fn create_sleep_seconds_mapping() -> HashMap<u64, u64> {
    let mut sleep_seconds_mapping = HashMap::new();

    for (chain_id, seconds) in CHAIN_BLOCK_SECONDS.clone().into_iter() {
        sleep_seconds_mapping.insert(chain_id, seconds);
    }

    // Insert a default value for the sleep seconds

    sleep_seconds_mapping
}

/// Create a mapping for chain id to polling URLs.
pub fn create_chain_mapping(
    the_graph_studio_api_key: Option<String>,
    the_graph_studio_enabled: bool,
    satsuma_api_key: Option<String>,
    satsuma_enabled: bool,
) -> HashMap<u64, HashMap<String, String>> {
    let mut chain_id_to_urls = HashMap::new();

    if the_graph_studio_api_key.is_some() && the_graph_studio_enabled {
        for (chain_id, id) in THE_GRAPH_STUDIO_SERVICE_IDS.clone().into_iter() {
            let url = format!(
                "{}/{}/{}/{}",
                THE_GRAPH_STUDIO_BASE_URL.clone(),
                the_graph_studio_api_key.clone().unwrap(),
                "subgraphs/id",
                id
            );
            let child_map = chain_id_to_urls.entry(chain_id).or_insert_with(HashMap::new);
            child_map.insert((*STUDIO).to_string(), url);
        }
    }

    if satsuma_api_key.is_some() && satsuma_enabled {
        for (chain_id, id) in SATSUMA_LIVE_IDS.clone().into_iter() {
            let url =
                format!("{}/{}/{}", SATSUMA_BASE_URL.clone(), satsuma_api_key.clone().unwrap(), id);
            let child_map = chain_id_to_urls.entry(chain_id).or_insert_with(HashMap::new);
            child_map.insert((*SATSUMA).to_string(), url);
        }
    }

    chain_id_to_urls
}
