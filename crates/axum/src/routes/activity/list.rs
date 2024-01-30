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
    authentication::{authenticate_user, authenticate_wallet_user},
    result::{AppJsonResult, AppResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    headers::{authorization::Bearer, Authorization},
    Json, TypedHeader,
};
use ethers_main::types::H160;
use lightdotso_prisma::activity::{self, WhereParam};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{or, Direction};
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

/// Returns a count of list of activities.
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
    let query_address: Option<H160> = query.address.as_ref().and_then(|s| s.parse().ok());

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

    if let Some(id) = &query.user_id {
        query_exp.push(or![activity::user_id::equals(Some(id.clone()))]);
    }

    // query_exp.push(or![activity::user_id::not(None)]);

    query_exp
}
