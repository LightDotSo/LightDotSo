// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![allow(clippy::unwrap_used)]

use axum::{
    body::Body,
    extract::{Path, State},
    http::{uri::Uri, Request, Response},
    response::IntoResponse,
    routing::get,
    Router,
};
use eyre::Result;
use hyper::{header::HeaderValue, HeaderMap};
use lightdotso_hyper::{get_hyper_client, HyperClient};
use lightdotso_tracing::tracing::info;
use std::net::SocketAddr;
use tokio::net::TcpListener;

async fn handler(
    Path(path): Path<String>,
    State(state): State<HyperClient>,
    mut req: Request<Body>,
) -> Response<Body> {
    let org_slug = "lightdotso";
    let query = req.uri().query().unwrap_or_default();
    let full_path = format!("{}/api/{}", org_slug, path);

    let uri = format!("https://api.fly.io/prometheus/{}?{}", full_path, query);
    info!("uri: {}", uri);

    *req.uri_mut() = Uri::try_from(uri).unwrap();

    let mut headers = HeaderMap::new();
    let token = std::env::var("FLY_API_TOKEN").unwrap_or_else(|_| panic!("FLY_API_TOKEN not set"));
    headers.insert("Authorization", HeaderValue::from_str(&format!("Bearer {}", token)).unwrap());

    *req.headers_mut() = headers;

    state.request(req).await.unwrap().into_response()
}

async fn health_check() -> &'static str {
    "OK"
}

pub async fn start_prometheus_server() -> Result<()> {
    info!("Starting prometheus server");

    let client = get_hyper_client()?;

    let app = Router::new()
        .route("/", get(health_check))
        // .route("/:anything", get(handler)) // fallback route that will handle all other paths
        .route("/api/*anything", get(handler)) // fallback route that will handle all other paths
        .with_state(client);

    let socket_addr = "0.0.0.0:3002";
    let listener = TcpListener::bind(socket_addr).await.unwrap();
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;

    Ok(())
}
