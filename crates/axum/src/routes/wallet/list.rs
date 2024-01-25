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

use super::types::Wallet;
use crate::{
    authentication::authenticate_user,
    result::{AppJsonResult, AppResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    headers::{authorization::Bearer, Authorization},
    Json, TypedHeader,
};
use lightdotso_prisma::{
    user,
    wallet::{self, WhereParam},
};
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
    /// The offset of the first wallet to return.
    pub offset: Option<i64>,
    /// The maximum number of wallets to return.
    pub limit: Option<i64>,
    /// A filter to return wallets w/ a given owner.
    pub owner: Option<String>,
    /// The user id to filter by.
    pub user_id: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of wallets.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct WalletListCount {
    /// The count of the list of wallets.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of wallets.
#[utoipa::path(
        get,
        path = "/wallet/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Wallets returned successfully", body = [Wallet]),
            (status = 500, description = "Wallet bad request", body = WalletError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<Vec<Wallet>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    let user_id = authenticate_user_id(
        &query,
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
    )
    .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the query.
    let query_params = construct_wallet_list_query_params(&query, user_id);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallets from the database.
    let wallets = state
        .client
        .wallet()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the wallets to the format that the API expects.
    let wallets: Vec<Wallet> = wallets.into_iter().map(Wallet::from).collect();

    Ok(Json::from(wallets))
}

/// Returns a count of list of wallets.
#[utoipa::path(
        get,
        path = "/wallet/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Wallets returned successfully", body = WalletListCount),
            (status = 500, description = "Wallet bad request", body = WalletError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_wallet_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<WalletListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    let user_id = authenticate_user_id(
        &query,
        &state,
        &mut session,
        auth.map(|auth| auth.token().to_string()),
    )
    .await?;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // Construct the query.
    let query_params = construct_wallet_list_query_params(&query, user_id);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the wallets from the database.
    let count = state.client.wallet().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(WalletListCount { count }))
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
) -> AppResult<Option<String>> {
    // If the user id is provided, authenticate the user.
    let user_id = if query.user_id.is_some() {
        Some(authenticate_user(state, session, auth_token, query.user_id.clone()).await?)
    } else {
        None
    };

    Ok(user_id)
}

/// Constructs a query for the database.
fn construct_wallet_list_query_params(
    query: &ListQuery,
    user_id: Option<String>,
) -> Vec<WhereParam> {
    let mut query_exp = match &query.owner {
        Some(owner) => vec![wallet::users::some(vec![user::address::equals(owner.to_string())])],
        None => vec![],
    };

    if let Some(user_id) = user_id {
        query_exp.push(wallet::users::some(vec![user::id::equals(user_id)]));
    }

    query_exp
}
