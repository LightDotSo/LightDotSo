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
    let res = init_metrics();
    if let Err(e) = res {
        error!("Failed to initialize metrics: {:?}", e)
    }

    info!("Starting server at {}", SHORT_VERSION);

    // // Parse the command line arguments
    // let args = ConsumerArgs::parse();

    // // Spawn tasks in the custom runtime and store join handles
    // let mut handles = Vec::new();

    // // Double the number of CPUs for consumer count
    // let consumer_count = num_cpus::get() * 2;
    // info!("Starting {} consumers", consumer_count);

    // for _ in 0..1 {
    //     let args_clone = args.clone();
    //     let handle = task::spawn(async move {
    //         loop {
    //             match args_clone.run().await {
    //                 Ok(_) => {
    //                     info!("Task completed successfully");
    //                     break;
    //                 }
    //                 Err(e) => {
    //                     error!("Task failed with error: {:?}, restarting task...", e);
    //                     continue;
    //                 }
    //             }
    //         }
    //     });
    //     handles.push(handle);
    // }

    // // Run internal server
    // let server_handle = task::spawn(start_internal_server());

    // // Wait for all tasks to complete
    // for handle in handles {
    //     let _ = handle.await;
    // }

    // Wait for the server task to complete.
    // let _ = server_handle.await;
}
