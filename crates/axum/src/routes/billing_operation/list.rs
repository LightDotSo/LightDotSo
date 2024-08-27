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

use super::types::BillingOperation;
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
use alloy::primitives::Address;
use lightdotso_prisma::{
    billing_operation::{self, WhereParam},
    paymaster_operation,
};
use serde::{Deserialize, Serialize};
use tower_sessions::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first billing operation to return.
    pub offset: Option<i64>,
    /// The maximum number of billing operations to return.
    pub limit: Option<i64>,
    /// The status to filter by.
    pub status: Option<String>,
    /// The id to filter by.
    pub id: Option<String>,
    /// The user id to filter by.
    pub user_id: Option<String>,
    /// The wallet address to filter by.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of billing operations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct BillingOperationListCount {
    /// The count of the list of billing operations.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of billing operations
#[utoipa::path(
        get,
        path = "/billing_operation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Billing operations returned successfully", body = [BillingOperation]),
            (status = 500, description = "Billing operation bad request", body = BillingOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_billing_operation_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<Vec<BillingOperation>> {
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
    let query_params = construct_billing_operation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the billing operations from the database.
    let billing_operations = state
        .client
        .billing_operation()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the billing operations to the format that the API expects.
    let billing_operations: Vec<BillingOperation> =
        billing_operations.into_iter().map(BillingOperation::from).collect();

    Ok(Json::from(billing_operations))
}

/// Returns a count of list of billing operations
#[utoipa::path(
        get,
        path = "/billing_operation/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Billing operations returned successfully", body = BillingOperationListCount),
            (status = 500, description = "Billing operation bad request", body = BillingOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_billing_operation_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
    mut session: Session,
    auth: Option<TypedHeader<Authorization<Bearer>>>,
) -> AppJsonResult<BillingOperationListCount> {
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
    let query_params = construct_billing_operation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the billing operations from the database.
    let count = state.client.billing_operation().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(BillingOperationListCount { count }))
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
    let query_address: H160 = query.address.parse()?;

    // Authenticate the user
    if query.user_id.is_some() {
        authenticate_user(state, session, auth_token.clone(), query.user_id.clone()).await?;
    }

    // If the wallet is specified, check to see if the user is an owner of the wallet.
    authenticate_wallet_user(
        state,
        session,
        &query_address,
        auth_token.clone(),
        query.user_id.clone(),
    )
    .await?;

    Ok(())
}

/// Constructs a query for paymaster operations.
fn construct_billing_operation_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = vec![billing_operation::paymaster_operation::is(vec![
        paymaster_operation::sender::equals(query.address.clone()),
    ])];

    if let Some(_status) = &query.status {
        query_exp.push(billing_operation::status::equals(
            lightdotso_prisma::BillingOperationStatus::Sponsored,
        ));
    }

    query_exp
}
