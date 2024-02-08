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

use super::types::UserNotificationSettings;
use crate::{
    authentication::authenticate_user,
    error::RouteError,
    result::{AppError, AppJsonResult},
    routes::user_notification_settings::error::UserNotificationSettingsError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    headers::{authorization::Bearer, Authorization},
    Json, TypedHeader,
};
use lightdotso_notifier::types::{USER_NOTIFICATION_DEFAULT_ENABLED, USER_NOTIFICATION_KEYS};
use lightdotso_prisma::{notification_settings, user, user_notification_settings};
use serde::Deserialize;
use std::collections::HashSet;
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
        path = "/user/notification/settings/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User Settings returned successfully", body = UserNotificationSettings),
            (status = 404, description = "User Settings not found", body = UserNotificationSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_user_notification_settings_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<UserNotificationSettings> {
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
    let user_notification_settings = state
        .client
        .user_notification_settings()
        .find_unique(user_notification_settings::user_id::equals(auth_user_id.clone()))
        .with(user_notification_settings::notification_settings::fetch(vec![]))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // If the user_notification_settings is not found, create a default user_notification_settings
    // in the db, if the user exists.
    if let Some(user_notification_settings) = user_notification_settings {
        let mut missing_notification_settings = vec![];

        // Compare the notification settings with the wallet notification keys.
        if let Some(notification_settings) =
            user_notification_settings.clone().notification_settings
        {
            // Create a HashSet for quicker lookup
            let settings_keys: HashSet<_> =
                notification_settings.iter().map(|s| s.key.clone()).collect();

            for key in USER_NOTIFICATION_KEYS.iter() {
                // Check if the key exists in settings_keys
                if !settings_keys.contains(key) {
                    missing_notification_settings.push(key.clone());
                }
            }
        } else {
            missing_notification_settings = USER_NOTIFICATION_KEYS.to_vec();
        }

        // If there are missing notification settings, add them to the wallet notification settings.
        if !missing_notification_settings.is_empty() {
            // -----------------------------------------------------------------
            // DB
            // -----------------------------------------------------------------

            let _ = state
                .client
                .notification_settings()
                .create_many(
                    missing_notification_settings
                        .iter()
                        .map(|key| {
                            (
                                key.clone(),
                                *USER_NOTIFICATION_DEFAULT_ENABLED.get(key).unwrap_or(&false),
                                auth_user_id.clone(),
                                vec![
                                    notification_settings::user_notification_settings_id::set(
                                        Some(user_notification_settings.clone().id),
                                    ),
                                    notification_settings::is_user_only::set(true),
                                ],
                            )
                        })
                        .collect(),
                )
                .exec()
                .await?;

            // Get the wallet notification settings again.
            let wallet_notification_settings = state
                .client
                .user_notification_settings()
                .find_unique(user_notification_settings::user_id::equals(auth_user_id.clone()))
                .with(user_notification_settings::notification_settings::fetch(vec![]))
                .exec()
                .await?;

            // If the wallet is not found, return a 404.
            let wallet_notification_settings = wallet_notification_settings.clone().ok_or(
                RouteError::UserNotificationSettingsError(UserNotificationSettingsError::NotFound(
                    "User notification not found".to_string(),
                )),
            )?;

            // -----------------------------------------------------------------
            // Return
            // -----------------------------------------------------------------

            let wallet_notification_settings: UserNotificationSettings =
                wallet_notification_settings.into();

            return Ok(Json::from(wallet_notification_settings));
        }

        let user_notification_settings: UserNotificationSettings =
            user_notification_settings.into();

        Ok(Json::from(user_notification_settings))
    } else {
        // ---------------------------------------------------------------------
        // DB
        // ---------------------------------------------------------------------

        let user =
            state.client.user().find_unique(user::id::equals(auth_user_id.clone())).exec().await?;

        if user.is_none() {
            return Err(AppError::RouteError(RouteError::UserNotificationSettingsError(
                UserNotificationSettingsError::NotFound(
                    "User notification settings not found".to_string(),
                ),
            )));
        }

        let user_notification_settings = state
            .client
            .user_notification_settings()
            .create(user::id::equals(auth_user_id.clone()), vec![])
            .exec()
            .await?;

        let _ = state.client.notification_settings().create_many(
            USER_NOTIFICATION_DEFAULT_ENABLED
                .iter()
                .map(|(key, value)| {
                    (
                        key.clone(),
                        *value,
                        auth_user_id.clone(),
                        vec![
                            notification_settings::user_notification_settings_id::set(Some(
                                user_notification_settings.clone().id,
                            )),
                            notification_settings::is_user_only::set(true),
                        ],
                    )
                })
                .collect(),
        );

        // ---------------------------------------------------------------------
        // Return
        // ---------------------------------------------------------------------

        let user_notification_settings: UserNotificationSettings =
            user_notification_settings.into();

        return Ok(Json::from(user_notification_settings));
    }
}
