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
pub(crate) mod logout;
pub(crate) mod nonce;
pub(crate) mod session;
pub(crate) mod types;
pub(crate) mod verify;

use autometrics::autometrics;
use axum::{
    routing::{get, post},
    Router,
};
use lightdotso_state::ClientState;

pub(crate) use crate::routes::auth::{
    logout::{__path_v1_auth_logout_handler, v1_auth_logout_handler},
    nonce::{__path_v1_auth_nonce_handler, v1_auth_nonce_handler},
    session::{__path_v1_auth_session_handler, v1_auth_session_handler},
    verify::{__path_v1_auth_verify_handler, v1_auth_verify_handler},
};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<ClientState> {
    Router::new()
        .route("/auth/nonce", get(v1_auth_nonce_handler))
        .route("/auth/session", get(v1_auth_session_handler))
        .route("/auth/logout", post(v1_auth_logout_handler))
        .route("/auth/verify", post(v1_auth_verify_handler))
}
