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

use super::types::UserSettings;
use crate::{authentication::authenticate_user, result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use lightdotso_prisma::{user, user_settings};
use serde::Deserialize;
use tower_sessions_core::Session;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The user id to filter by. (for admin purposes only)
    pub user_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a user settings
#[utoipa::path(
        get,
        path = "/user/settings/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User settings returned successfully", body = UserSettings),
            (status = 404, description = "User settings not found", body = UserSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_settings_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<UserSettings> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = authenticate_user(
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
        query.user_id,
    )
    .await?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the signatures from the database.
    let user_settings = state
        .client
        .user_settings()
        .upsert(
            user_settings::user_id::equals(auth_user_id.clone()),
            user_settings::create(user::id::equals(auth_user_id.clone()), vec![]),
            vec![],
        )
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    let user_settings: UserSettings = user_settings.into();

    return Ok(Json::from(user_settings));
}
