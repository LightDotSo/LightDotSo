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

use axum::{
    body::Body,
    http::{HeaderValue, Request, Response},
    middleware::Next,
};

/// Add the version headers to the response
pub async fn add_version_headers(request: Request<Body>, next: Next) -> Response<Body> {
    let mut response = next.run(request).await;

    // Build information
    if let Ok(build_timestamp) = std::env::var("VERGEN_BUILD_TIMESTAMP") {
        if let Ok(value) = HeaderValue::from_str(&build_timestamp) {
            response.headers_mut().insert("X-Build-Timestamp", value);
        }
    }

    // Git information
    if let Ok(git_hash) = std::env::var("VERGEN_GIT_SHA") {
        if let Ok(hash_value) = HeaderValue::from_str(&git_hash) {
            response.headers_mut().insert("X-Git-Hash", hash_value);
        }
    }

    // Version information
    if let Ok(version) = std::env::var("VERGEN_BUILD_SEMANTIC_VERSION") {
        if let Ok(version_value) = HeaderValue::from_str(&version) {
            response.headers_mut().insert("X-Version", version_value);
        }
    }

    // Commit date
    if let Ok(commit_date) = std::env::var("VERGEN_GIT_COMMIT_DATE") {
        if let Ok(commit_date_value) = HeaderValue::from_str(&commit_date) {
            response.headers_mut().insert("X-Commit-Date", commit_date_value);
        }
    }

    response
}
