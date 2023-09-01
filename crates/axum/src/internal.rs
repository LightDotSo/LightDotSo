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
use axum::{
    extract::{Path, State},
    response::Response,
    routing::get,
    Router,
};
use eyre::Result;
use lightdotso_redis::{get_most_recent_indexed_block, get_redis_client, redis::Client};
use std::{convert::Infallible, sync::Arc};

#[autometrics]
async fn health_check() -> &'static str {
    "OK"
}

#[autometrics]
async fn prometheus_metrics_check() -> Response<String> {
    prometheus_exporter::encode_http_response()
}

#[autometrics]
async fn get_indexed_block(
    State(redis_client): State<Arc<Client>>,
    chain_id: Path<String>,
) -> Result<Response<String>, Infallible> {
    let mut con = redis_client.get_connection().unwrap();
    let block = get_most_recent_indexed_block(&mut con, &chain_id);

    Ok(Response::builder().status(200).body(block.unwrap().to_string()).unwrap())
}

pub async fn start_indexer_server() -> Result<()> {
    let redis_client: Arc<Client> = Arc::new(get_redis_client().unwrap());
    let app = Router::new().route("/:chain_id", get(get_indexed_block)).with_state(redis_client);

    let socket_addr = "[::]:3000".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}

pub async fn start_internal_server() -> Result<()> {
    prometheus_exporter::init();

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/metrics", get(prometheus_metrics_check));

    let socket_addr = "0.0.0.0:9091".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}
