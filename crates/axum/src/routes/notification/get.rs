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

use super::types::Notification;
use crate::{
    error::RouteError, result::AppJsonResult, routes::notification::error::NotificationError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::notification;
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub(crate) struct GetQuery {
    /// The id of the notification to get.
    pub notification_id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a notification
#[utoipa::path(
        get,
        path = "/notification/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Notification returned successfully", body = Notification),
            (status = 404, description = "Notification not found", body = NotificationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_notification_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Notification> {
    // Get the get query.
    let Query(query) = get;

    info!("Get notification for address: {:?}", query);

    // Get the notifications from the database.
    let notification = client
        .client
        .notification()
        .find_unique(notification::id::equals(query.notification_id))
        .exec()
        .await?;

    // If the notification is not found, return a 404.
    let notification = notification.ok_or(RouteError::NotificationError(
        NotificationError::NotFound("Notification not found".to_string()),
    ))?;

    // Change the notification to the format that the API expects.
    let notification: Notification = notification.into();

    Ok(Json::from(notification))
}
