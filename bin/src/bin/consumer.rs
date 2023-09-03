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

use clap::Parser;
use dotenvy::dotenv;
use lightdotso_axum::internal::start_internal_server;
use lightdotso_bin::version::SHORT_VERSION;
use lightdotso_consumer::config::ConsumerArgs;
use lightdotso_tracing::{
    init, init_metrics, otel, stdout,
    tracing::{error, info, Level},
};

#[tokio::main]
pub async fn main() {
    let _ = dotenv();

    let res = init_metrics();
    if let Err(e) = res {
        error!("Failed to initialize metrics: {:?}", e)
    }

    init(vec![stdout(Level::INFO), otel()]);

    info!("Starting server at {}", SHORT_VERSION);

    // Parse the command line arguments
    let args = ConsumerArgs::parse();

    // Start the internal server in a separate task
    tokio::spawn(async {
        loop {
            if let Err(e) = start_internal_server().await {
                error!("Internal server failed: {:?}", e);
                info!("Restarting internal server");
            }
        }
    });

    // Get the number of CPUs and start that many consumers
    let cpu_count = num_cpus::get();
    info!("Starting {} consumers", cpu_count);

    // Run the futures in parallel
    for _ in 0..cpu_count {
        // Clone the args for each thread
        let args_clone = args.clone();

        // Start the consumer in a separate task
        tokio::spawn(async move {
            loop {
                if let Err(e) = args_clone.run().await {
                    error!("Consumer failed: {:?}", e);
                    info!("Restarting failed consumer");
                }
            }
        });
    }
}
