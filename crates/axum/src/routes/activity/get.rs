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

use super::types::Activity;
use crate::{error::RouteError, result::AppJsonResult, routes::activity::error::ActivityError};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::activity;
use lightdotso_state::ClientState;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The id of the activity.
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get an activity
///
/// Gets an activity by id.
#[utoipa::path(
        get,
        path = "/activity/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Activity returned successfully", body = Activity),
            (status = 404, description = "Activity not found", body = ActivityError),
        ),
        tag = "activity"
    )]
#[autometrics]
pub(crate) async fn v1_activity_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Activity> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the activitys from the database.
    let activity = state
        .client
        .activity()
        .find_unique(activity::id::equals(query.id))
        .with(activity::user::fetch())
        .exec()
        .await?;

    // If the activity is not found, return a 404.
    let activity = activity.ok_or(RouteError::ActivityError(ActivityError::NotFound(
        "Activity not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the activity to the format that the API expects.
    let activity: Activity = activity.into();

    Ok(Json::from(activity))
}
