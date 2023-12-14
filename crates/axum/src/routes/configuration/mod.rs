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

use crate::{
    routes::configuration::{
        get::v1_configuration_get_handler, list::v1_configuration_list_handler,
    },
    state::AppState,
};
use autometrics::autometrics;
use axum::{routing::get, Router};

pub(crate) use error::ConfigurationError;

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/configuration/get", get(v1_configuration_get_handler))
        .route("/configuration/list", get(v1_configuration_list_handler))
}
