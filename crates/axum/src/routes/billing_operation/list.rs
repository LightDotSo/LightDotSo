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
