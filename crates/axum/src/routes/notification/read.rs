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

use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{extract::State, Json};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationReadRequestParams {
    /// The array of the notifications to query.
    pub notifications: Vec<NotificationReadRequest>,
}

/// Item to request.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationReadRequest {
    /// The id of the notification to read for.
    id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Read a list of notifications
#[utoipa::path(
        post,
        path = "/notification/read",
        request_body = NotificationReadRequestParams,
        responses(
            (status = 200, description = "Notification created successfully", body = i64),
            (status = 500, description = "Notification internal error", body = UserOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_notification_read_handler(
    State(client): State<AppState>,
    Json(params): Json<NotificationReadRequestParams>,
) -> AppJsonResult<i64> {
    // Get the notification from the post body.
    let notifications = params.notifications;

    // Create the notification the database.
    let notifications = client
        .client
        .notification()
        .update_many(
            vec![lightdotso_prisma::notification::id::contains(
                notifications.iter().map(|notification| notification.clone().id).collect(),
            )],
            vec![],
        )
        .exec()
        .await?;
    info!(?notifications);

    Ok(Json::from(notifications))
}
