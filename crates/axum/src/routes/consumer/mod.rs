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

pub(crate) mod covalent;
pub(crate) mod error;
pub(crate) mod portfolio;
pub(crate) mod routescan;
pub(crate) mod types;

use autometrics::autometrics;
use axum::{routing::post, Router};
use lightdotso_state::ClientState;

pub(crate) use covalent::{__path_v1_consumer_covalent_handler, v1_consumer_covalent_handler};
pub(crate) use portfolio::{__path_v1_consumer_portfolio_handler, v1_consumer_portfolio_handler};
pub(crate) use routescan::{__path_v1_consumer_routescan_handler, v1_consumer_routescan_handler};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<ClientState> {
    Router::new()
        .route("/consumer/covalent", post(v1_consumer_covalent_handler))
        .route("/consumer/portfolio", post(v1_consumer_portfolio_handler))
        .route("/consumer/routescan", post(v1_consumer_routescan_handler))
}
