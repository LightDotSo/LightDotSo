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

use autometrics::autometrics;
use axum::response::IntoResponse;

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Check if the server is running
#[utoipa::path(
        get,
        path = "/check",
        responses(
            (status = 200, description = "Check returned successfully"),
        )
    )]
#[autometrics]
pub async fn handler() -> impl IntoResponse {
    "Ok"
}
