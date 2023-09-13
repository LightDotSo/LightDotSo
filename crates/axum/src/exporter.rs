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

use axum::{routing::get, Router};
use eyre::Result;
use lightdotso_prometheus::{metrics_handler, parse_indexer_metrics};
use lightdotso_tracing::tracing::info;
use tokio::time::{sleep, Duration};

async fn periodic_metrics_update() {
    loop {
        info!("Updating exporter metrics");

        let _ = parse_indexer_metrics().await;
        // Keeps in sync with the fly.io health check interval
        sleep(Duration::from_secs(15)).await;
    }
}

pub async fn start_exporter_server() -> Result<()> {
    // Start a task to periodically update the metrics
    tokio::spawn(periodic_metrics_update());

    let app = Router::new()
        .merge(crate::routes::health::router())
        .route("/metrics", get(metrics_handler));

    let socket_addr = "0.0.0.0:9091".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}
