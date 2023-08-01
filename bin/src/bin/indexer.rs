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

use anyhow::Result;
use axum::{routing::get, Router};
use clap::Parser;
use lightdotso_bin::version::{LONG_VERSION, SHORT_VERSION};
use lightdotso_indexer::config::IndexerArgs;
use lightdotso_tracing::{init, stdout, tracing::Level};

async fn health_check() -> &'static str {
    "OK"
}

pub async fn start_server() -> Result<()> {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/health", get(health_check));

    let socket_addr = "0.0.0.0:3002".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}

#[tokio::main]
pub async fn main() -> Result<(), anyhow::Error> {
    println!("Starting server at {} {}", SHORT_VERSION, LONG_VERSION);

    // Initialize the logger
    init(vec![stdout(Level::INFO)]);

    // Parse the command line arguments
    let args = IndexerArgs::parse();

    // Construct the futures
    let indexer_future = args.run();
    let server_future = start_server();

    // Run the futures concurrently
    let result = tokio::try_join!(indexer_future, server_future);

    // Return the result accordingly
    match result {
        Ok((_, _)) => Ok(()),
        Err(e) => Err(e),
    }
}
