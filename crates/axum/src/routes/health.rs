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
use axum::{response::IntoResponse, routing::get, Router};
use http_body::Body as HttpBody;

#[autometrics]
pub(crate) fn router<S, B>() -> Router<S, B>
where
    B: HttpBody + Send + 'static,
    S: Clone + Send + Sync + 'static,
{
    Router::new().route("/health", get(handler))
}

/// Check the health of the server.
#[utoipa::path(
        get,
        path = "/v1/health",
        responses(
            (status = 200, description = "Health returned successfully"),
        )
    )]
#[autometrics]
async fn handler() -> impl IntoResponse {
    "Ok"
}
