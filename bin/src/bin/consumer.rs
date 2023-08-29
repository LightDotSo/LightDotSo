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

use autometrics::{autometrics, prometheus_exporter};
use axum::{routing::get, Router};
use dotenvy::dotenv;
use eyre::Result;
use lightdotso_autometrics::API_SLO;
use lightdotso_bin::version::SHORT_VERSION;
use lightdotso_consumer::config::ConsumerArgs;
use lightdotso_kafka::namespace::TRANSACTION;
use lightdotso_tracing::{
    init, init_metrics, otel, stdout,
    tracing::{error, info, Level},
};

#[autometrics(objective = API_SLO)]
async fn health_check() -> &'static str {
    "OK"
}

pub async fn start_server() -> Result<()> {
    let app = Router::new()
        .route("/", get("consumer.light.so"))
        .route("/health", get(health_check))
        .route("/metrics", get(|| async { prometheus_exporter::encode_http_response() }));

    let socket_addr = "0.0.0.0:3008".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}

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
    let args = ConsumerArgs { group: "all".to_string(), topics: vec![TRANSACTION.to_string()] };

    // Construct the futures
    let consumer_future_1 = args.run();
    let consumer_future_2 = args.run();
    let server_future = start_server();

    // Run the futures concurrently
    let result = tokio::try_join!(consumer_future_1, consumer_future_2, server_future);

    // Exit with an error if either future failed
    if let Err(e) = result {
        eprintln!("Error: {:?}", e);
        std::process::exit(1);
    }
}
