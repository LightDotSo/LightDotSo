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

use crate::result::AppJsonResult;
use axum::Json;
use lightdotso_tracing::tracing::info;
use tower_sessions::Session;

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Logout a session
#[utoipa::path(
        post,
        path = "/auth/logout",
        responses(
            (status = 200, description = "Auth logout returned successfully", body = ()),
            (status = 404, description = "Auth logout not succeeded", body = AuthError),
        )
    )]
pub(crate) async fn v1_auth_logout_handler(session: Session) -> AppJsonResult<()> {
    info!(?session);

    session.clear();

    Ok(Json::from(()))
}
