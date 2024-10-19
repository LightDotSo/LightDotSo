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

use super::types::Notification;
use crate::{
    error::RouteError, result::AppJsonResult, routes::notification::error::NotificationError,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::notification;
use lightdotso_state::ClientState;
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
///
/// Gets a notification by id.
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
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Notification> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get notification for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the notifications from the database.
    let notification = state
        .client
        .notification()
        .find_unique(notification::id::equals(query.notification_id))
        .with(notification::activity::fetch())
        .exec()
        .await?;

    // If the notification is not found, return a 404.
    let notification = notification.ok_or(RouteError::NotificationError(
        NotificationError::NotFound("Notification not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the notification to the format that the API expects.
    let notification: Notification = notification.into();

    Ok(Json::from(notification))
}
