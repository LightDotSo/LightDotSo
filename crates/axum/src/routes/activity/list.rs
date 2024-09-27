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
use crate::{
    authentication::{authenticate_user, authenticate_wallet_user},
    result::{AppJsonResult, AppResult},
    state::AppState,
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
use lightdotso_prisma::activity::{self, WhereParam};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::Direction;
use serde::{Deserialize, Serialize};
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

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
    /// The user id to filter by.
    pub user_id: Option<String>,
    /// Flag to query for only user initiated activities.
    pub is_user_related: Option<bool>,
    /// The wallet address to filter by.
    pub address: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of user operations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct ActivityListCount {
    /// The count of the list of user operations..
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of activities
///
/// Gets a list of activities with optional filtering.
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
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<Vec<Activity>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    authenticate_user_id(&query, &state, &mut session, auth.map(|auth| auth.token().to_string()))
        .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_activity_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the activities from the database.
    let activities = state
        .client
        .activity()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .with(activity::user::fetch())
        .order_by(activity::timestamp::order(Direction::Desc))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the activities to the format that the API expects.
    let activities: Vec<Activity> = activities.into_iter().map(Activity::from).collect();

    Ok(Json::from(activities))
}

/// Returns a count of list of activities
///
/// Gets a count of activities with optional filtering.
#[utoipa::path(
        get,
        path = "/activity/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Activities returned successfully", body = ActivityListCount),
            (status = 500, description = "Activity bad request", body = ActivityError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_activity_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<ActivityListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    authenticate_user_id(&query, &state, &mut session, auth.map(|auth| auth.token().to_string()))
        .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_activity_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the activities from the database.
    let count = state.client.activity().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(ActivityListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Authenticates the user and returns the user id.
async fn authenticate_user_id(
    query: &ListQuery,
    state: &AppState,
    session: &mut Session,
    auth_token: Option<String>,
) -> AppResult<()> {
    // Parse the address.
    let query_address: Option<Address> = query.address.as_ref().and_then(|s| s.parse().ok());

    // Authenticate the user
    if query.user_id.is_some() {
        authenticate_user(state, session, auth_token.clone(), query.user_id.clone()).await?;
    }

    // If the wallet is specified, check to see if the user is an owner of the wallet.
    if let Some(addr) = query_address {
        authenticate_wallet_user(state, session, &addr, auth_token.clone(), query.user_id.clone())
            .await?;
    }

    Ok(())
}

/// Constructs a query for activities.
fn construct_activity_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(addr) => {
            vec![activity::wallet_address::equals(Some(addr.clone()))]
        }
        None => vec![],
    };

    if query.is_user_related.unwrap_or(false) {
        query_exp.push(activity::user_id::not(None));
    }

    query_exp
}
