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

/// Update the user settings
#[utoipa::path(
        put,
        path = "/user/settings/update",
        params(
            PutQuery
        ),
        request_body = UserSettingsUpdateRequestParams,
        responses(
            (status = 200, description = "User settings updated successfully", body = UserSettings),
            (status = 400, description = "Invalid configuration", body = UserSettingsError),
            (status = 409, description = "User settings already exists", body = UserSettingsError),
            (status = 500, description = "User settings internal error", body = UserSettingsError),
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
