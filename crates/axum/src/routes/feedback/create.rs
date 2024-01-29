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

use super::types::Feedback;
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
    let auth_user_id = get_user_id(&mut session)?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the feedback the database.
    let feedback = state
        .client
        .feedback()
        .create(
            feedback.text,
            feedback.emoji,
            lightdotso_prisma::user::id::equals(auth_user_id.clone()),
            vec![],
        )
        .exec()
        .await?;
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
                user_id: Some(auth_user_id),
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
