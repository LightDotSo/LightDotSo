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

use crate::{error::RouteError, result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use lightdotso_prisma::paymaster;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub id: String,
}

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    // The offset of the first paymaster to return.
    pub offset: Option<i64>,
    // The maximum number of paymasters to return.
    pub limit: Option<i64>,
}

/// PaymasterOperation operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum PaymasterOperationError {
    // PaymasterOperation query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// PaymasterOperation not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct PaymasterOperation {
    address: String,
}

// Implement From<paymaster::Data> for PaymasterOperation.
impl From<paymaster::Data> for PaymasterOperation {
    fn from(paymaster: paymaster::Data) -> Self {
        Self { address: paymaster.address }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/paymaster_operation/get", get(v1_paymaster_operation_get_handler))
        .route("/paymaster_operation/list", get(v1_paymaster_operation_list_handler))
}

/// Get a paymaster
#[utoipa::path(
        get,
        path = "/paymaster_operation/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Paymaster Operation returned successfully", body = PaymasterOperation),
            (status = 404, description = "Paymaster Operation not found", body = PaymasterOperationError),
        )
    )]
#[autometrics]
async fn v1_paymaster_operation_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<PaymasterOperation> {
    // Get the get query.
    let Query(query) = get;

    info!("Get paymaster for address: {:?}", query);

    // Get the paymasters from the database.
    let paymaster_operation = client
        .client
        .unwrap()
        .paymaster()
        .find_unique(paymaster::id::equals(query.id))
        .exec()
        .await?;

    // If the paymaster is not found, return a 404.
    let paymaster_operation = paymaster_operation.ok_or(RouteError::PaymasterOperationError(
        PaymasterOperationError::NotFound("Paymaster Operation not found".to_string()),
    ))?;

    // Change the paymaster operation to the format that the API expects.
    let paymaster_operation: PaymasterOperation = paymaster_operation.into();

    Ok(Json::from(paymaster_operation))
}

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
async fn v1_paymaster_operation_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<PaymasterOperation>> {
    // Get the pagination query.
    let Query(pagination) = pagination;

    // Get the paymasters from the database.
    let paymasters = client
        .client
        .unwrap()
        .paymaster()
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
