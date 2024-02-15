// Copyright 2023-2024 Light, Inc.
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
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::billing_operation::{self, WhereParam};
use prisma_client_rust::or;
use serde::{Deserialize, Serialize};
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
) -> AppJsonResult<Vec<BillingOperation>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

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
            (status = 500, description = "BillingOperation bad request", body = BillingOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_billing_operation_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<BillingOperationListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

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

/// Constructs a query for billing operations.
fn construct_billing_operation_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.id {
        Some(id) => vec![or![billing_operation::id::equals(id.to_string())]],
        None => vec![],
    };

    if let Some(_status) = &query.status {
        query_exp.push(billing_operation::status::equals(
            lightdotso_prisma::BillingOperationStatus::Sponsored,
        ));
    }

    query_exp
}
