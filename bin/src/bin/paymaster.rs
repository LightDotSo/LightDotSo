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
use lightdotso_paymaster::config::PaymasterArgs;
use lightdotso_tracing::{
    init, init_metrics, otel, stdout,
    tracing::{info, Level},
};

#[tokio::main]
pub async fn main() {
    let _ = dotenv();

    let log_level = match std::env::var("ENVIRONMENT").unwrap_or_default().as_str() {
        "development" => Level::TRACE,
        _ => Level::INFO,
    };

    let _ = init_metrics();

    info!("Starting server at {}", SHORT_VERSION);

    // Run the test server if we're running in Fly
    if std::env::var("FLY_APP_NAME").is_ok_and(|s| s == "lightdotso-paymaster") {
        let test_server_future = start_internal_server();
        let result = test_server_future.await;

        if result.is_err() {
            std::process::exit(1)
        };
    }

    // Parse the command line arguments
    let args = PaymasterArgs::parse();

    // Construct the futures
    let paymaster_future = args.run();
    let internal_future = start_internal_server();

    // Run the futures concurrently
    let result = tokio::try_join!(paymaster_future, internal_future);

    // Exit with an error if either future failed
    if let Err(e) = result {
        eprintln!("Error: {:?}", e);
        std::process::exit(1);
    }
}
