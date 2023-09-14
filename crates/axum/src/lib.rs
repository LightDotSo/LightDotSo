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

use axum::{
    body::{Body, Bytes},
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    BoxError,
};
use lightdotso_tracing::tracing::{debug, info};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use tower_governor::{errors::GovernorError, key_extractor::KeyExtractor};

pub mod api;
pub mod exporter;
pub mod indexer;
pub mod internal;
pub mod prometheus;
pub mod result;
pub mod routes;
pub mod rpc;

#[derive(Debug, Serialize, Deserialize, Clone, Eq, PartialEq)]
pub struct UserToken;

impl KeyExtractor for UserToken {
    type Key = String;

    fn extract<B>(&self, req: &Request<B>) -> Result<Self::Key, GovernorError> {
        req.headers()
            .get("Authorization")
            .and_then(|token| token.to_str().ok())
            .and_then(|token| token.strip_prefix("Bearer "))
            .map(|token| token.trim().to_owned())
            .ok_or(GovernorError::UnableToExtractKey)
    }
    fn key_name(&self, key: &Self::Key) -> Option<String> {
        Some(key.to_string())
    }
    fn name(&self) -> &'static str {
        "UserToken"
    }
}

pub async fn print_request_response(
    req: Request<Body>,
    next: Next<Body>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let (parts, body) = req.into_parts();
    let bytes = buffer_and_print("request", body).await?;
    let req = Request::from_parts(parts, Body::from(bytes));

    info!("{:?}", req);

    let res = next.run(req).await;

    let (parts, body) = res.into_parts();
    let bytes = buffer_and_print("response", body).await?;
    let res = Response::from_parts(parts, Body::from(bytes));

    Ok(res)
}

async fn buffer_and_print<B>(direction: &str, body: B) -> Result<Bytes, (StatusCode, String)>
where
    B: axum::body::HttpBody<Data = Bytes>,
    B::Error: std::fmt::Display,
{
    let bytes = match hyper::body::to_bytes(body).await {
        Ok(bytes) => bytes,
        Err(err) => {
            return Err((
                StatusCode::BAD_REQUEST,
                format!("failed to read {} body: {}", direction, err),
            ));
        }
    };

    if let Ok(body) = std::str::from_utf8(&bytes) {
        debug!("{} body = {:?}", direction, body);
    }

    Ok(bytes)
}

// Handle errors
// From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L308
pub async fn handle_error(error: BoxError) -> impl IntoResponse {
    if error.is::<tower::load_shed::error::Overloaded>() {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            Cow::from("service is overloaded, please try again later"),
        );
    }

    (StatusCode::INTERNAL_SERVER_ERROR, Cow::from(format!("Unhandled internal error: {}", error)))
}
