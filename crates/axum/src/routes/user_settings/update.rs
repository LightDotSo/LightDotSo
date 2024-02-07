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

#![allow(clippy::unwrap_used)]

use super::types::{UserSettings, UserSettingsOptional};
use crate::{authentication::authenticate_user, result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    headers::{authorization::Bearer, Authorization},
    Json, TypedHeader,
};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{user, user_settings, ActivityEntity, ActivityOperation};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PutQuery {
    /// The user id to filter by. (for admin purposes only)
    pub user_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct UserSettingsUpdateRequestParams {
    /// The result of the user_settings.
    pub user_settings: UserSettingsOptional,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a user_settings
#[utoipa::path(
        put,
        path = "/user/settings/update",
        params(
            PutQuery
        ),
        request_body = UserSettingsUpdateRequestParams,
        responses(
            (status = 200, description = "User Settings updated successfully", body = UserSettings),
            (status = 400, description = "Invalid Configuration", body = UserSettingsError),
            (status = 409, description = "User Settings already exists", body = UserSettingsError),
            (status = 500, description = "User Settings internal error", body = UserSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_settings_update_handler(
    put_query: Query<PutQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
    Json(params): Json<UserSettingsUpdateRequestParams>,
) -> AppJsonResult<UserSettings> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the put query.
    let Query(put) = put_query;

    // Get the user_settings from the put body.
    let _user_settings = params.user_settings;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = authenticate_user(
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
        put.user_id,
    )
    .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // For each user_settings, create the params update.
    let params = vec![];

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the user_settings the database.
    let user_settings = state
        .client
        .user_settings()
        .upsert(
            user_settings::user_id::equals(auth_user_id.clone()),
            user_settings::create(user::id::equals(auth_user_id.clone()), params.clone()),
            params.clone(),
        )
        .exec()
        .await?;
    info!(?user_settings);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::UserSettings,
        &ActivityMessage {
            operation: ActivityOperation::Update,
            log: serde_json::to_value(&user_settings)?,
            params: CustomParams { user_id: Some(auth_user_id), ..Default::default() },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let user_settings: UserSettings = user_settings.into();

    Ok(Json::from(user_settings))
}
