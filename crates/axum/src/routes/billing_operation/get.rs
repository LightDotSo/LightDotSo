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
    error::RouteError, result::AppJsonResult,
    routes::billing_operation::error::BillingOperationError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::billing_operation;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The id of the billing operation.
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a billing operation
#[utoipa::path(
        get,
        path = "/billing_operation/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Billing operation returned successfully", body = BillingOperation),
            (status = 404, description = "Billing operation not found", body = BillingOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_billing_operation_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<BillingOperation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpreation action from the database.
    let billing_operation = state
        .client
        .billing_operation()
        .find_unique(billing_operation::id::equals(query.id))
        .exec()
        .await?;

    // If the paymaster is not found, return a 404.
    let billing_operation = billing_operation.ok_or(RouteError::BillingOperationError(
        BillingOperationError::NotFound("Billing operation not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the billing operation to the format that the API expects.
    let billing_operation: BillingOperation = billing_operation.into();

    Ok(Json::from(billing_operation))
}
