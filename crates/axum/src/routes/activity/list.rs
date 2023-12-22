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
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::extract::{Query, State};
use axum::Json;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first activity to return.
    pub offset: Option<i64>,
    /// The maximum number of activities to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of activities.
#[utoipa::path(
        get,
        path = "/activity/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Activities returned successfully", body = [Activity]),
            (status = 500, description = "Activity bad request", body = ActivityError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_activity_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Activity>> {
    // Get the list query.
    let Query(query) = list_query;

    // Get the activities from the database.
    let activities = state
        .client
        .activity()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the activities to the format that the API expects.
    let activities: Vec<Activity> = activities.into_iter().map(Activity::from).collect();

    Ok(Json::from(activities))
}
