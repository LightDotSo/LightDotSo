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

use super::types::Activity;
use crate::{
    error::RouteError, result::AppJsonResult, routes::activity::error::ActivityError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::activity;
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

/// Get a activity
#[utoipa::path(
        get,
        path = "/activity/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Activity returned successfully", body = Activity),
            (status = 404, description = "Activity not found", body = ActivityError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_activity_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Activity> {
    // Get the get query.
    let Query(query) = get_query;

    // Get the activitys from the database.
    let activity =
        state.client.activity().find_unique(activity::id::equals(query.id)).exec().await?;

    // If the activity is not found, return a 404.
    let activity = activity.ok_or(RouteError::ActivityError(ActivityError::NotFound(
        "Activity not found".to_string(),
    )))?;

    // Change the activity to the format that the API expects.
    let activity: Activity = activity.into();

    Ok(Json::from(activity))
}
