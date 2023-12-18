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

use super::types::Notification;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub(crate) struct ListQuery {
    /// The offset of the first notification to return.
    pub offset: Option<i64>,
    /// The maximum number of notifications to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

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
pub(crate) async fn v1_notification_list_handler(
    list_query: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Notification>> {
    // Get the list query.
    let Query(query) = list_query;

    // Get the notifications from the database.
    let notifications = client
        .client
        .notification()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the notifications to the format that the API expects.
    let notifications: Vec<Notification> =
        notifications.into_iter().map(Notification::from).collect();

    Ok(Json::from(notifications))
}
