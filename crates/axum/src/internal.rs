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
use ethers_main::{
    prelude::Provider,
    providers::{Http, Middleware},
};
use eyre::Result;
use lightdotso_redis::{
    get_indexed_percentage, get_last_n_indexed_blocks, get_most_recent_indexed_block,
    get_redis_client, redis::Client,
};
use serde::{Deserialize, Serialize};
use std::{convert::Infallible, sync::Arc};

#[autometrics]
async fn health_check() -> &'static str {
    "OK"
}

#[autometrics]
async fn prometheus_metrics_check() -> Response<String> {
    prometheus_exporter::encode_http_response()
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct IndexResponse {
    latest_block: i64,
    indexed_block: i64,
    all_percentage: f64,
    last_300_percentage: f64,
    last_indexed_blocks: Vec<i64>,
}

#[autometrics]
async fn get_recent_block(
    State(redis_client): State<Arc<Client>>,
    chain_id: Path<String>,
) -> Result<Response<String>, Infallible> {
    // Construct the rpc
    let rpc = format!("http://lightdotso-rpc-internal.internal:3000/internal/{:?}", chain_id);

    // Create the http client
    let http_client = Provider::<Http>::try_from(rpc).unwrap();

    // Get the block number
    let block_number = http_client.get_block_number().await.unwrap().as_u64() as i64;

    // Get the connection
    let mut con = redis_client.get_connection().unwrap();

    // Get the most recent indexed block
    let indexed_block = get_most_recent_indexed_block(&mut con, &chain_id).unwrap();

    // Get the most recent indexed block percentage
    let percentage = get_indexed_percentage(&mut con, &chain_id, block_number).unwrap();

    // Get last 300 percentage
    let last_300_percentage =
        get_indexed_percentage(&mut con, &chain_id, block_number - 300).unwrap();

    // Get the last 10 blocks
    let last_indexed_blocks = get_last_n_indexed_blocks(&mut con, &chain_id, 10).unwrap();

    // Construct the response
    let response = IndexResponse {
        latest_block: block_number,
        indexed_block,
        all_percentage: percentage,
        last_300_percentage,
        last_indexed_blocks,
    };

    // Return the response as json
    Ok(Response::builder().status(200).body(serde_json::to_string(&response).unwrap()).unwrap())
}

pub async fn start_indexer_server() -> Result<()> {
    // Construct the redis
    let redis_client: Arc<Client> = Arc::new(get_redis_client().unwrap());

    // Construct the app
    let app = Router::new()
        .route("/", get("indexer.light.so"))
        .route("/:chain_id", get(get_recent_block))
        .with_state(redis_client);

    // Listen on port 3000
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
