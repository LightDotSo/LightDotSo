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

pub(crate) mod create;
pub(crate) mod error;
pub(crate) mod get;
pub(crate) mod list;
pub(crate) mod types;

use crate::state::AppState;
use autometrics::autometrics;
use axum::{
    routing::{get, post},
    Router,
};

pub(crate) use create::{__path_v1_invite_code_post_handler, v1_invite_code_post_handler};
pub(crate) use get::{__path_v1_invite_code_get_handler, v1_invite_code_get_handler};
pub(crate) use list::{
    __path_v1_invite_code_list_count_handler, __path_v1_invite_code_list_handler,
    v1_invite_code_list_count_handler, v1_invite_code_list_handler,
};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/invite_code/create", post(v1_invite_code_post_handler))
        .route("/invite_code/get", get(v1_invite_code_get_handler))
        .route("/invite_code/list", get(v1_invite_code_list_handler))
        .route("/invite_code/list/count", get(v1_invite_code_list_count_handler))
}
