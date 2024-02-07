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

use super::types::NotificationSettings;
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::notification_settings::error::NotificationSettingsError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::notification_settings;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The id of the interpretation action.
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a paymaster
#[utoipa::path(
        get,
        path = "/notification_settings/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Interpretation action returned successfully", body = NotificationSettings),
            (status = 404, description = "Interpretation action not found", body = NotificationSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_notification_settings_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<NotificationSettings> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpreation action from the database.
    let notification_settings = state
        .client
        .notification_settings()
        .find_unique(notification_settings::id::equals(query.id))
        .exec()
        .await?;

    // If the paymaster is not found, return a 404.
    let notification_settings =
        notification_settings.ok_or(RouteError::NotificationSettingsError(
            NotificationSettingsError::NotFound("Interpretation action not found".to_string()),
        ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the interpretation action to the format that the API expects.
    let notification_settings: NotificationSettings = notification_settings.into();

    Ok(Json::from(notification_settings))
}
