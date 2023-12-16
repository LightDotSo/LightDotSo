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

use super::types::PaymasterOperation;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::extract::{Query, State};
use axum::Json;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first paymaster operation to return.
    pub offset: Option<i64>,
    /// The maximum number of paymaster operations to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of paymasters.
#[utoipa::path(
        get,
        path = "/paymaster_operation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Paymaster Operations returned successfully", body = [PaymasterOperation]),
            (status = 500, description = "Paymaster Operation bad request", body = PaymasterOperationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_paymaster_operation_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<PaymasterOperation>> {
    // Get the pagination query.
    let Query(pagination) = pagination;

    // Get the paymasters from the database.
    let paymasters = client
        .client
        .paymaster_operation()
        .find_many(vec![])
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the paymasters to the format that the API expects.
    let paymasters: Vec<PaymasterOperation> =
        paymasters.into_iter().map(PaymasterOperation::from).collect();

    Ok(Json::from(paymasters))
}
