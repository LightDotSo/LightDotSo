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
use lightdotso_indexer::constants::DEPLOY_CHAIN_IDS;
use lightdotso_redis::{
    block::{
        get_indexed_percentage, get_last_n_indexed_blocks, get_last_n_indexed_percentage,
        get_most_recent_indexed_block,
    },
    get_redis_client,
    redis::Client,
};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use std::{convert::Infallible, sync::Arc};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct IndexResponse {
    latest_block_number: i64,
    latest_indexed_block: i64,
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
    let rpc =
        format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", chain_id.as_str());
    info!("rpc: {}", rpc);

    // Create the http client
    let http_client = Provider::<Http>::try_from(rpc).unwrap();

    // Get the block number
    let latest_block_number = http_client.get_block_number().await.unwrap().as_u64() as i64;

    // Get the connection
    let mut con = redis_client.get_connection().unwrap();

    // Get the most recent indexed block
    let latest_indexed_block = get_most_recent_indexed_block(&mut con, &chain_id).unwrap();

    // Get the start block
    let start_block = DEPLOY_CHAIN_IDS.get(&chain_id.parse::<u64>().unwrap()).unwrap();

    // Get the most recent indexed block percentage
    let percentage =
        get_indexed_percentage(&mut con, &chain_id, latest_block_number - start_block).unwrap();

    // Get last 300 percentage
    let last_300_percentage = get_last_n_indexed_percentage(&mut con, &chain_id, 300).unwrap();

    // Get the last 100 blocks
    let last_indexed_blocks = get_last_n_indexed_blocks(&mut con, &chain_id, 100).unwrap();

    // Construct the response
    let response = IndexResponse {
        latest_block_number,
        latest_indexed_block,
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
        .merge(crate::routes::health::router())
        .merge(crate::routes::metrics::router());

    let socket_addr = "0.0.0.0:9091".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}
