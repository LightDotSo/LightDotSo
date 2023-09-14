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

use autometrics::autometrics;
use axum::{
    extract::{Path, State},
    http::{uri::Uri, Request, Response},
    routing::get,
    Router,
};
use eyre::Result;
use hyper::{client, client::HttpConnector, header::HeaderValue, Body, HeaderMap};
use hyper_rustls::HttpsConnector;
use lightdotso_tracing::tracing::info;

type Client = hyper::client::Client<HttpsConnector<HttpConnector>, Body>;

#[autometrics]
async fn handler(
    Path(path): Path<String>,
    State(client): State<Client>,
    mut req: Request<Body>,
) -> Response<Body> {
    let org_slug = "lightdotso";
    let query = req.uri().query().unwrap_or_default();
    let full_path = format!("{}/api/v1/{}", org_slug, path);

    let uri = format!("https://api.fly.io/prometheus/{}?{}", full_path, query);
    info!("uri: {}", uri);

    *req.uri_mut() = Uri::try_from(uri).unwrap();

    let mut headers = HeaderMap::new();
    let token = std::env::var("FLY_API_TOKEN").unwrap_or_else(|_| panic!("FLY_API_TOKEN not set"));
    headers.insert("Authorization", HeaderValue::from_str(&format!("Bearer {}", token)).unwrap());

    *req.headers_mut() = headers;

    client.request(req).await.unwrap()
}

#[autometrics]
async fn health_check() -> &'static str {
    "OK"
}

pub async fn start_prometheus_server() -> Result<()> {
    info!("Starting prometheus server");

    let https = hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .https_only()
        .enable_http1()
        .build();
    // Build the hyper client from the HTTPS connector.
    let client: client::Client<_, hyper::Body> = client::Client::builder().build(https);

    let app = Router::new()
        .route("/api/v1/:anything", get(handler)) // fallback route that will handle all other paths
        .with_state(client);

    let socket_addr = "0.0.0.0:3002".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}
