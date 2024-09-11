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

#![recursion_limit = "512"]

use axum::{http::StatusCode, response::Response, BoxError};

pub mod admin;
pub mod api;
pub mod authentication;
pub mod constants;
pub mod cookies;
pub mod error;
pub mod internal;
pub mod prometheus;
pub mod result;
pub mod routes;
pub mod rpc;
pub mod sessions;
pub mod state;

// Handle errors
// From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L308
pub async fn handle_error(error: BoxError) -> Response<String> {
    let response = Response::new(format!("INTERNAL SERVER ERROR: {error}"));
    let (mut parts, body) = response.into_parts();
    parts.status = StatusCode::INTERNAL_SERVER_ERROR;
    Response::from_parts(parts, body)
}
