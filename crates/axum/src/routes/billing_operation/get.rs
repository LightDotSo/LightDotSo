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

/// Get a paymaster
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
