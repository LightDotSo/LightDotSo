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
pub(crate) mod get;
pub(crate) mod list;
pub(crate) mod types;
pub(crate) mod update;

use crate::state::AppState;
use autometrics::autometrics;
use axum::{routing::get, Router};

pub(crate) use get::{__path_v1_chain_get_handler, v1_chain_get_handler};
pub(crate) use list::{__path_v1_chain_list_handler, v1_chain_list_handler};
pub(crate) use update::{__path_v1_chain_update_handler, v1_chain_update_handler};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/chain/get", get(v1_chain_get_handler))
        .route("/chain/list", get(v1_chain_list_handler))
        .route("/chain/update", get(v1_chain_update_handler))
}
