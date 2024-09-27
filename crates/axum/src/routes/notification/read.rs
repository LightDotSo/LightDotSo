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

use crate::{result::AppJsonResult, sessions::get_user_id, state::AppState};
use autometrics::autometrics;
use axum::{extract::State, Json};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationReadRequestParams {
    /// The array of the notifications to query.
    pub notifications: Vec<NotificationReadParams>,
}

/// Item to request.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationReadParams {
    /// The id of the notification to read for.
    id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Read a list of notifications
///
/// Reads a list of notifications by id.
#[utoipa::path(
        post,
        path = "/notification/read",
        request_body = NotificationReadRequestParams,
        responses(
            (status = 200, description = "Notification created successfully", body = i64),
            (status = 500, description = "Notification internal error", body = NotificationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_notification_read_handler(
    State(state): State<AppState>,
    mut session: Session,
    Json(params): Json<NotificationReadRequestParams>,
) -> AppJsonResult<i64> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the notification from the post body.
    let notifications = params.notifications;

    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id from the session.
    let auth_user_id = get_user_id(&mut session).await?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Update the notification the database.
    let notifications_count = state
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
    info!(?notifications_count);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    for notification in notifications {
        // Produce an activity message.
        let _ = produce_activity_message(
            state.producer.clone(),
            ActivityEntity::Notification,
            &ActivityMessage {
                operation: ActivityOperation::Update,
                log: serde_json::to_value(&notification)?,
                params: CustomParams {
                    notification_id: Some(notification.id.clone()),
                    user_id: Some(auth_user_id.clone()),
                    ..Default::default()
                },
            },
        )
        .await;
    }

    Ok(Json::from(notifications_count))
}
