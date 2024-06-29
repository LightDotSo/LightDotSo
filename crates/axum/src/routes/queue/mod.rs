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

pub(crate) mod error;
pub(crate) mod interpretation;
pub(crate) mod portfolio;
pub(crate) mod token;
pub(crate) mod transaction;
pub(crate) mod types;
pub(crate) mod user_operation;

use crate::state::AppState;
use autometrics::autometrics;
use axum::{routing::post, Router};

pub(crate) use interpretation::{
    __path_v1_queue_interpretation_handler, v1_queue_interpretation_handler,
};
pub(crate) use portfolio::{__path_v1_queue_portfolio_handler, v1_queue_portfolio_handler};
pub(crate) use token::{__path_v1_queue_token_handler, v1_queue_token_handler};
pub(crate) use transaction::{__path_v1_queue_transaction_handler, v1_queue_transaction_handler};
pub(crate) use user_operation::{
    __path_v1_queue_user_operation_handler, v1_queue_user_operation_handler,
};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/queue/interpretation", post(v1_queue_interpretation_handler))
        .route("/queue/portfolio", post(v1_queue_portfolio_handler))
        .route("/queue/token", post(v1_queue_token_handler))
        .route("/queue/transaction", post(v1_queue_transaction_handler))
        .route("/queue/user_operation", post(v1_queue_user_operation_handler))
}
