// Copyright 2023-2024 Light
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

use axum::{
    headers::{authorization::Bearer, Authorization},
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
    TypedHeader,
};

// Code from: https://docs.rs/axum/latest/axum/middleware/fn.from_fn.html
// This is a middleware that checks if the Authorization header is valid

pub async fn admin<B>(
    // run the `TypedHeader` extractor
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    // you can also add more extractors here but the last
    // extractor must implement `FromRequest` which
    // `Request` does
    request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    if token_is_valid(auth.token()) {
        let response = next.run(request).await;
        Ok(response)
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

pub fn token_is_valid(token: &str) -> bool {
    let admin_secret_env = std::env::var("ADMIN_SECRET_ENV");

    match admin_secret_env {
        Ok(secrets) => {
            let secrets: Vec<&str> = secrets.split(',').collect();
            // If token matches any of the secrets, return true
            secrets.contains(&token)
        }
        Err(_) => false,
    }
}
