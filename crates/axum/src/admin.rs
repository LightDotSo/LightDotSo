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

fn token_is_valid(token: &str) -> bool {
    let secret_env = std::env::var("SECRET_ENV").expect("SECRET_ENV must be set");
    let secrets: Vec<&str> = secret_env.split(',').collect();

    // If token matches any of the secrets, return true
    secrets.contains(&token)
}
