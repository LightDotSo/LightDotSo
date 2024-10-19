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

use super::{error::NotificationError, types::Notification};
use crate::{
    authentication::{authenticate_user, authenticate_wallet_user},
    result::{AppJsonResult, AppResult},
    sessions::get_user_id,
};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use lightdotso_prisma::{
    activity,
    notification::{self, WhereParam},
};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
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
    /// The address to filter by.
    pub address: Option<String>,
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

/// List notifications
///
/// Returns a list of notifications with optional filtering.
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
    State(state): State<ClientState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<Vec<Notification>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    let auth_user_id = authenticate_user_id(
        &query,
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
    )
    .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_activity_list_query_params(&query, auth_user_id);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the notifications from the database.
    let notifications = state
        .client
        .notification()
        .find_many(query_params)
        .with(notification::activity::fetch().with(activity::user::fetch()))
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the notifications to the format that the API expects.
    let notifications: Vec<Notification> =
        notifications.into_iter().map(Notification::from).collect();

    Ok(Json::from(notifications))
}

/// Returns a count of list of notifications
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
    State(state): State<ClientState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<NotificationListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    let user_id = unauthenticate_user_id(
        &query,
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
    )
    .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_activity_list_query_params(&query, user_id);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the notifications from the database.
    let count = state.client.notification().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(NotificationListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Gets the user id from the session, regardless of whether the user is authenticated.
async fn unauthenticate_user_id(
    query: &ListQuery,
    state: &ClientState,
    session: &mut Session,
    auth_token: Option<String>,
) -> AppResult<String> {
    // If the user id is provided, authenticate the user.
    let user_id = if query.user_id.is_some() {
        authenticate_user(state, session, auth_token, query.user_id.clone()).await?
    } else {
        get_user_id(session).await?
    };

    Ok(user_id)
}

/// Authenticates the user and returns the user id.
async fn authenticate_user_id(
    query: &ListQuery,
    state: &ClientState,
    session: &mut Session,
    auth_token: Option<String>,
) -> AppResult<String> {
    // Parse the address.
    let query_address: Option<Address> = query.address.as_ref().and_then(|s| s.parse().ok());

    // If the user id is provided, authenticate the user.
    let auth_user_id = if query.user_id.is_some() {
        authenticate_user(state, session, auth_token, query.user_id.clone()).await?
    } else if let Some(addr) = query_address {
        authenticate_wallet_user(state, session, &addr, None, None).await?
    } else {
        get_user_id(session).await?
    };

    Ok(auth_user_id)
}

/// Constructs a query for notifications.
fn construct_activity_list_query_params(query: &ListQuery, user_id: String) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(addr) => {
            vec![notification::wallet_address::equals(Some(addr.clone()))]
        }
        None => vec![],
    };

    query_exp.push(notification::user_id::equals(Some(user_id.clone())));

    query_exp
}
