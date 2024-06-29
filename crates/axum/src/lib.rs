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

#![recursion_limit = "512"]

use axum::{http::StatusCode, response::IntoResponse, BoxError};
use std::borrow::Cow;

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
pub mod types;

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
