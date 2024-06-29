// Copyright 2023-2024 Light.
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

use crate::state::AppState;
use autometrics::autometrics;
use axum::{
    extract::{Path, State},
    response::Response,
    routing::get,
    Router,
};
use http::{HeaderMap, HeaderValue};
use hyper::{Body, Request, Uri};
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

#[autometrics]
pub async fn socket_proxy_handler(
    Path(path): Path<String>,
    State(state): State<AppState>,
    mut req: Request<Body>,
) -> Response<Body> {
    let query = req.uri().query().map(ToString::to_string).unwrap_or_default();

    let uri = format!("https://api.socket.tech/{}?{}", path, query);
    info!("uri: {}", uri);

    *req.uri_mut() = Uri::try_from(uri).unwrap();

    let mut headers = HeaderMap::new();
    let token =
        std::env::var("SOCKET_API_KEY").unwrap_or_else(|_| panic!("SOCKET_API_KEY not set"));
    headers.insert("API-KEY", HeaderValue::from_str(&token).unwrap());

    *req.headers_mut() = headers;

    state.hyper.request(req).await.unwrap()
}

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

pub(crate) fn router() -> Router<AppState, Body> {
    Router::new().route("/socket/*path", get(socket_proxy_handler))
}
