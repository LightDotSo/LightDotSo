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

use autometrics::{autometrics, prometheus_exporter};
use axum::{response::IntoResponse, routing::get, Router};

use crate::state::AppState;

pub(crate) fn router() -> Router<AppState> {
    Router::new().route("/metrics", get(handler))
}

#[autometrics]
async fn handler() -> impl IntoResponse {
    prometheus_exporter::encode_http_response()
}

// From: https://github.com/get10101/10101/blob/a5f50e765c9a21ada284255fc2f742d01c4cba2f/maker/src/routes.rs#L245
// License: MIT
// #[autometrics]
// pub async fn handler(State(state): State<AppState>) -> impl IntoResponse {
//     // Get the autometrics.
//     let autometrics = match autometrics::prometheus_exporter::encode_to_string() {
//         Ok(metrics) => metrics,
//         Err(err) => {
//             error!("Could not collect autometrics {err:#}");
//             return (StatusCode::INTERNAL_SERVER_ERROR, format!("{:?}", err));
//         }
//     };

//     // Get the exporter and encoder.
//     let encoder = TextEncoder::new();

//     // Gather the metrics.
//     let metric_families = prometheus::gather();

//     // Return the metrics.
//     let mut result = vec![];

//     // Encode the metrics.
//     match encoder.encode(&metric_families, &mut result) {
//         Ok(()) => (),
//         Err(err) => {
//             error!("Could not collect opentelemetry metrics {err:#}");
//             return (StatusCode::INTERNAL_SERVER_ERROR, format!("{:?}", err));
//         }
//     };

//     // Convert the metrics to a string.
//     let open_telemetry_metrics = match String::from_utf8(result) {
//         Ok(s) => s,
//         Err(err) => {
//             error!("Could not format metrics as string {err:#}");
//             return (StatusCode::INTERNAL_SERVER_ERROR, format!("{:?}", err));
//         }
//     };

//     (StatusCode::OK, open_telemetry_metrics + &autometrics)
// }
