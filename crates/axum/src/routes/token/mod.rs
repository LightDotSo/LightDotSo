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

pub(crate) mod error;
pub(crate) mod get;
pub(crate) mod list;
pub(crate) mod types;
pub(crate) mod update;

use autometrics::autometrics;
use axum::{
    routing::{get, put},
    Router,
};
use lightdotso_state::ClientState;

pub(crate) use get::{__path_v1_token_get_handler, v1_token_get_handler};
pub(crate) use list::{
    __path_v1_token_list_count_handler, __path_v1_token_list_handler, v1_token_list_count_handler,
    v1_token_list_handler,
};
pub(crate) use update::{__path_v1_token_update_handler, v1_token_update_handler};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<ClientState> {
    Router::new()
        .route("/token/get", get(v1_token_get_handler))
        .route("/token/list", get(v1_token_list_handler))
        .route("/token/list/count", get(v1_token_list_count_handler))
        .route("/token/update", put(v1_token_update_handler))
}
