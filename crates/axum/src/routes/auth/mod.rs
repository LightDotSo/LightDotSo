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

pub(crate) mod error;
pub(crate) mod logout;
pub(crate) mod nonce;
pub(crate) mod session;
pub(crate) mod verify;

use crate::state::AppState;
use autometrics::autometrics;
use axum::{
    routing::{get, post},
    Router,
};

pub(crate) use crate::routes::auth::logout::{
    __path_v1_auth_logout_handler, v1_auth_logout_handler,
};
pub(crate) use crate::routes::auth::nonce::{__path_v1_auth_nonce_handler, v1_auth_nonce_handler};
pub(crate) use crate::routes::auth::session::{
    __path_v1_auth_session_handler, v1_auth_session_handler,
};
pub(crate) use crate::routes::auth::verify::{
    __path_v1_auth_verify_handler, v1_auth_verify_handler,
};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/nonce", get(v1_auth_nonce_handler))
        .route("/auth/session", get(v1_auth_session_handler))
        .route("/auth/logout", post(v1_auth_logout_handler))
        .route("/auth/verify", post(v1_auth_verify_handler))
}
