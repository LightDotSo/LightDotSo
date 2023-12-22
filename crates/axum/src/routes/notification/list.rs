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
use lightdotso_prisma::notification::{self, WhereParam};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

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
    /// The user id to filter by.
    pub user_id: Option<String>,
    /// The wallet address to filter by.
    pub wallet_address: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of user operations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationListCount {
    /// The count of the list of user operations..
    pub count: i64,
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
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Notification>> {
    // Get the list query.
    let Query(query) = list_query;

    // If the address is provided, add it to the query.
    let query_params = construct_notification_list_query_params(&query);

    // Get the notifications from the database.
    let notifications = state
        .client
        .notification()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the notifications to the format that the API expects.
    let notifications: Vec<Notification> =
        notifications.into_iter().map(Notification::from).collect();

    Ok(Json::from(notifications))
}

/// Returns a count of list of notifications.
#[utoipa::path(
        get,
        path = "/notification/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Notifications returned successfully", body = NotificationListCount),
            (status = 500, description = "Notification bad request", body = NotificationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_notification_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<NotificationListCount> {
    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // If the address is provided, add it to the query.
    let query_params = construct_notification_list_query_params(&query);

    // Get the notifications from the database.
    let count = state.client.notification().count(query_params).exec().await?;

    Ok(Json::from(NotificationListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for notifications.
fn construct_notification_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.wallet_address {
        Some(addr) => {
            vec![notification::wallet_address::equals(Some(addr.clone()))]
        }
        None => vec![],
    };

    if let Some(id) = &query.user_id {
        query_exp.push(notification::user_id::equals(Some(id.clone())));
    }

    query_exp
}
