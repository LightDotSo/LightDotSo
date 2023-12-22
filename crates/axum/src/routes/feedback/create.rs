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
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    /// The id of the user to query.
    pub user_id: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct FeedbackPostRequestParams {
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
        params(
            PostQuery
        ),
        request_body = FeedbackPostRequestParams,
        responses(
            (status = 200, description = "Feedback created successfully", body = Feedback),
            (status = 500, description = "Feedback internal error", body = FeedbackError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_feedback_post_handler(
    post_query: Query<PostQuery>,
    State(state): State<AppState>,
    Json(params): Json<FeedbackPostRequestParams>,
) -> AppJsonResult<Feedback> {
    // Get the post query.
    let Query(query) = post_query;

    // Get the user id from the post query.
    let user_id = query.user_id;

    // Get the feedback from the post body.
    let feedback = params.feedback;

    // Create the feedback the database.
    let feedback = state
        .client
        .feedback()
        .create(feedback.text, feedback.emoji, lightdotso_prisma::user::id::equals(user_id), vec![])
        .exec()
        .await?;
    info!(?feedback);

    // Change the feedbacks to the format that the API expects.
    let feedback: Feedback = feedback.into();

    Ok(Json::from(feedback))
}
