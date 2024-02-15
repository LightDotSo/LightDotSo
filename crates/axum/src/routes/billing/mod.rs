// Copyright 2023-2024 Light, Inc.
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
pub(crate) mod get;
pub(crate) mod list;
pub(crate) mod types;
pub(crate) mod update;

use crate::state::AppState;
use autometrics::autometrics;
use axum::{
    routing::{get, put},
    Router,
};

pub(crate) use get::{__path_v1_billing_get_handler, v1_billing_get_handler};
pub(crate) use list::{__path_v1_billing_list_handler, v1_billing_list_handler};
pub(crate) use update::{__path_v1_billing_update_handler, v1_billing_update_handler};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/billing/get", get(v1_billing_get_handler))
        .route("/billing/list", get(v1_billing_list_handler))
        .route("/billing/update", put(v1_billing_update_handler))
}
