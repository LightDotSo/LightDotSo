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

use super::types::Feedback;
use crate::{result::AppJsonResult, sessions::get_user_id, state::AppState};
use autometrics::autometrics;
use axum::{extract::State, Json};
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{feedback, ActivityEntity, ActivityOperation};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct FeedbackCreateRequestParams {
    /// The result of the feedback.
    pub feedback: Feedback,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a feedback
///
/// Creates a feedback for the application.
#[utoipa::path(
        post,
        path = "/feedback/create",
        request_body = FeedbackCreateRequestParams,
        responses(
            (status = 200, description = "Feedback created successfully", body = Feedback),
            (status = 500, description = "Feedback internal error", body = FeedbackError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_feedback_create_handler(
    State(state): State<AppState>,
    mut session: Session,
    Json(params): Json<FeedbackCreateRequestParams>,
) -> AppJsonResult<Feedback> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the feedback from the post body.
    let feedback = params.feedback;

    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id from the session.
    let auth_user_id = get_user_id(&mut session).await.ok();

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Push to params depending on the user id.
    let params = match auth_user_id.clone() {
        Some(auth_user_id) => vec![feedback::user_id::set(Some(auth_user_id.clone()))],
        None => vec![],
    };

    // Create the feedback the database.
    let feedback =
        state.client.feedback().create(feedback.text, feedback.emoji, params).exec().await?;
    info!(?feedback);

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::Feedback,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&feedback)?,
            params: CustomParams {
                feedback_id: Some(feedback.id.clone()),
                user_id: auth_user_id,
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the feedbacks to the format that the API expects.
    let feedback: Feedback = feedback.into();

    Ok(Json::from(feedback))
}
