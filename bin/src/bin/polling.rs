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

use clap::Parser;
use eyre::{eyre, Result};
use lightdotso_axum::internal::start_internal_server;
use lightdotso_bin::version::SHORT_VERSION;
use lightdotso_polling::config::PollingArgs;
use lightdotso_tracing::{
    init_metrics,
    tracing::{error, info},
};

pub async fn start_polling() -> Result<()> {
    std::thread::spawn(|| {
        futures::executor::block_on(async {
            let args = PollingArgs::parse();
            let _ = args.run();
        })
    })
    .join()
    .map_err(|_| eyre!("Thread panicked"))?;
    Ok(())
}

#[tokio::main]
pub async fn main() {
    // Initialize tracing
    let res = init_metrics();
    if let Err(e) = res {
        error!("Failed to initialize metrics: {:?}", e)
    }

    info!("Starting server at {}", SHORT_VERSION);

    // Construct the futures
    let polling_future = start_polling();
    let internal_future = start_internal_server();

    // Run the futures concurrently
    let result = tokio::try_join!(polling_future, internal_future);

    // Exit with an error if either future failed
    if let Err(e) = result {
        eprintln!("Error: {:?}", e);
        std::process::exit(1);
    }
}
