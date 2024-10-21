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
use lightdotso_axum::internal::start_internal_server;
use lightdotso_bin::version::SHORT_VERSION;
use lightdotso_consumer::config::ConsumerArgs;
use lightdotso_tracing::{
    init_metrics,
    tracing::{error, info},
};
use tokio::task;

#[tokio::main(flavor = "multi_thread", worker_threads = 8)]
pub async fn main() {
    // Initialize tracing
    let res = init_metrics();
    if let Err(e) = res {
        error!("Failed to initialize metrics: {:?}", e)
    }

    info!("Starting server at {}", SHORT_VERSION);

    // Parse the command line arguments
    let args =
        ConsumerArgs::try_parse().unwrap_or_else(|_| ConsumerArgs::parse_from(["".to_string()]));

    // Spawn tasks in the custom runtime and store join handles
    let mut handles = Vec::new();

    // Multiply the number of CPUs by the multiplier
    let mut consumer_count = num_cpus::get() * args.cpu_multiplier;
    info!("Starting {} consumers", consumer_count);

    // If env var `ENVIRONMENT` is set to `development`, then set the counter to 1
    // so that we can debug the consumer.
    if std::env::var("ENVIRONMENT") == Ok("development".to_string()) {
        info!("Overriding consumer count to 1 for development");
        consumer_count = 1;
    }

    for _ in 0..consumer_count {
        let args_clone = args.clone();
        let handle = task::spawn(async move {
            loop {
                match args_clone.run().await {
                    Ok(_) => {
                        info!("Task completed successfully");
                        break;
                    }
                    Err(e) => {
                        error!("Task failed with error: {:?}, restarting task...", e);
                        continue;
                    }
                }
            }
        });
        handles.push(handle);
    }

    // Run internal server
    let server_handle = task::spawn(start_internal_server());

    // Wait for all tasks to complete
    for handle in handles {
        let _ = handle.await;
    }

    // Wait for the server task to complete.
    let _ = server_handle.await;
}
