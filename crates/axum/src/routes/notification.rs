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

use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use lightdotso_prisma::notification;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub notification_id: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first notification to return.
    pub offset: Option<i64>,
    // The maximum number of notifications to return.
    pub limit: Option<i64>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct NotificationPostRequestParams {
    /// The array of the notifications to query.
    pub notifications: Vec<NotificationRequest>,
}

/// Notification operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum NotificationError {
    // Notification query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Notification not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Notification {
    id: String,
}

/// Item to request.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct NotificationRequest {
    id: String,
}

// Implement From<notification::Data> for Notification.
impl From<notification::Data> for Notification {
    fn from(notification: notification::Data) -> Self {
        Self { id: notification.id }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/notification/get", get(v1_notification_get_handler))
        .route("/notification/list", get(v1_notification_list_handler))
        .route("/notification/read", get(v1_notification_read_handler))
}

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
async fn v1_notification_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Notification> {
    // Get the get query.
    let Query(query) = get;

    info!("Get notification for address: {:?}", query);

    // Get the notifications from the database.
    let notification = client
        .client
        .unwrap()
        .notification()
        .find_unique(notification::id::equals(query.notification_id))
        .exec()
        .await?;

    // If the notification is not found, return a 404.
    let notification = notification.ok_or(AppError::NotFound)?;

    // Change the notification to the format that the API expects.
    let notification: Notification = notification.into();

    Ok(Json::from(notification))
}

/// Returns a list of notifications.
#[utoipa::path(
        get,
        path = "/notification/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Notifications returned successfully", body = [Notification]),
            (status = 500, description = "Notification bad request", body = NotificationError),
        )
    )]
#[autometrics]
async fn v1_notification_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Notification>> {
    // Get the pagination query.
    let Query(pagination) = pagination;

    // Get the notifications from the database.
    let notifications = client
        .client
        .unwrap()
        .notification()
        .find_many(vec![])
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the notifications to the format that the API expects.
    let notifications: Vec<Notification> =
        notifications.into_iter().map(Notification::from).collect();

    Ok(Json::from(notifications))
}

/// Read a list of notifications
#[utoipa::path(
        post,
        path = "/notification/read",
        request_body = NotificationPostRequestParams,
        responses(
            (status = 200, description = "Notification created successfully", body = i64),
            (status = 500, description = "Notification internal error", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_notification_read_handler(
    State(client): State<AppState>,
    Json(params): Json<NotificationPostRequestParams>,
) -> AppJsonResult<i64> {
    // Get the notification from the post body.
    let notifications = params.notifications;

    // Create the notification the database.
    let notifications = client
        .client
        .unwrap()
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
