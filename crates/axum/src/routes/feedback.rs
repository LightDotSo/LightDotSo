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
use axum::{
    extract::{Query, State},
    routing::post,
    Json, Router,
};
use lightdotso_prisma::feedback;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The id of the user operation.
    pub user_id: String,
}

/// Feedback operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum FeedbackError {
    // Feedback query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Feedback not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Feedback {
    // The text of the feedback.
    pub text: String,
    // The emoji of the feedback.
    pub emoji: String,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct FeedbackPostRequestParams {
    /// The result of the feedback.
    pub feedback: Feedback,
}

// Implement From<feedback::Data> for Feedback.
impl From<feedback::Data> for Feedback {
    fn from(feedback: feedback::Data) -> Self {
        Self { text: feedback.text, emoji: feedback.emoji }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new().route("/feedback/create", post(v1_feedback_post_handler))
}

/// Create a feedback
#[utoipa::path(
        post,
        path = "/feedback/create",
        params(
            PostQuery
        ),
        request_body = FeedbackPostRequestParams,
        responses(
            (status = 200, description = "Feedback created successfully", body = UserOperation),
            (status = 500, description = "Feedback internal error", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_feedback_post_handler(
    post: Query<PostQuery>,
    State(client): State<AppState>,
    Json(params): Json<FeedbackPostRequestParams>,
) -> AppJsonResult<Feedback> {
    // Get the post query.
    let Query(post) = post;

    // Get the user id from the post query.
    let user_id = post.user_id;

    // Get the feedback from the post body.
    let feedback = params.feedback;

    // Create the feedback the database.
    let feedback = client
        .client
        .unwrap()
        .feedback()
        .create(feedback.text, feedback.emoji, lightdotso_prisma::user::id::equals(user_id), vec![])
        .exec()
        .await?;
    info!(?feedback);

    // Change the feedbacks to the format that the API expects.
    let feedback: Feedback = feedback.into();

    Ok(Json::from(feedback))
}
