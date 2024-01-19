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

#![allow(clippy::unwrap_used)]

use crate::state::AppState;
use autometrics::autometrics;
use axum::{
    extract::{Path, State},
    response::Response,
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
