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
use eyre::Result;
use lightdotso_axum::internal::start_internal_server;
use lightdotso_bin::version::SHORT_VERSION;
use lightdotso_db::db::create_client;
use lightdotso_indexer::config::IndexerArgs;
use lightdotso_tracing::{
    init_metrics,
    tracing::{error, info},
};
use std::sync::Arc;

#[tokio::main]
pub async fn main() -> Result<()> {
    // Initialize tracing
    let res = init_metrics();
    if let Err(e) = res {
        error!("Failed to initialize metrics: {:?}", e)
    }

    info!("Starting server at {}", SHORT_VERSION);

    // Run the test server if we're running in Fly
    if std::env::var("FLY_APP_NAME").is_ok_and(|s| s == "lightdotso-indexer") {
        let internal_server_future = start_internal_server();

        let result = tokio::try_join!(internal_server_future);

        if result.is_err() {
            std::process::exit(1)
        };
    }

    // Parse the command line arguments
    let args =
        IndexerArgs::try_parse().unwrap_or_else(|_| IndexerArgs::parse_from(["".to_string()]));

    // Create the db client
    let db = Arc::new(create_client().await?);

    // Construct the futures
    let indexer_future = args.run(db);
    let internal_future = start_internal_server();

    // Run the futures concurrently
    let result = tokio::try_join!(indexer_future, internal_future);

    // Exit with an error if either future failed
    if let Err(e) = result {
        eprintln!("Error: {:?}", e);
        std::process::exit(1);
    }

    Ok(())
}
