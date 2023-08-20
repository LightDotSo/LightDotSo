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
use autometrics::{autometrics, prometheus_exporter};
use axum::{routing::get, Router};
use clap::Parser;
use dotenvy::dotenv;
use lightdotso_bin::version::SHORT_VERSION;
use lightdotso_db::db::create_client;
use lightdotso_indexer::config::IndexerArgs;
use lightdotso_tracing::{
    init, init_metrics, otel, stdout,
    tracing::{info, Level},
};
use std::sync::Arc;

#[autometrics]
async fn health_check() -> &'static str {
    "OK"
}

pub async fn start_server() -> Result<()> {
    prometheus_exporter::init();

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/health", get(health_check))
        .route("/metrics", get(|| async { prometheus_exporter::encode_http_response() }));

    let socket_addr = "0.0.0.0:3002".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}

#[tokio::main]
pub async fn main() {
    let _ = dotenv();

    let log_level = match std::env::var("ENVIRONMENT").unwrap_or_default().as_str() {
        "development" => Level::TRACE,
        _ => Level::INFO,
    };

    init(vec![stdout(log_level), otel()]);

    let _ = init_metrics();

    info!("Starting server at {}", SHORT_VERSION);

    // Run the test server if we're running in Fly
    if std::env::var("FLY_APP_NAME").is_ok_and(|s| s == "lightdotso-indexer") {
        let test_server_future = start_server();
        let result = test_server_future.await;

        if result.is_err() {
            std::process::exit(1)
        };
    }

    // Parse the command line arguments
    let args = IndexerArgs::parse();

    // Create the db client
    let db = Arc::new(create_client().await.unwrap());

    // Construct the futures
    let indexer_future = args.run(db);
    let server_future = start_server();

    // Run the futures concurrently
    let result = tokio::try_join!(indexer_future, server_future);

    // Exit with an error if either future failed
    if let Err(e) = result {
        eprintln!("Error: {:?}", e);
        std::process::exit(1);
    }
}
