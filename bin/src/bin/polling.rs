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
use eyre::Result;
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
    .expect("Thread panicked");
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
