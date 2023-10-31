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

use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
};
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

/// Paymaster operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum PaymasterError {
    // Paymaster query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Paymaster not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Paymaster {
    address: String,
}

// Implement From<paymaster::Data> for Paymaster.
impl From<paymaster::Data> for Paymaster {
    fn from(paymaster: paymaster::Data) -> Self {
        Self { address: paymaster.address }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new()
        .route("/paymaster/get", get(v1_paymaster_get_handler))
        .route("/paymaster/list", get(v1_paymaster_list_handler))
}

/// Get a paymaster
#[utoipa::path(
        get,
        path = "/paymaster/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Paymaster returned successfully", body = Paymaster),
            (status = 404, description = "Paymaster not found", body = PaymasterError),
        )
    )]
#[autometrics]
async fn v1_paymaster_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Paymaster> {
    // Get the get query.
    let Query(query) = get;

    info!("Get paymaster for address: {:?}", query);

    // Get the paymasters from the database.
    let paymaster = client
        .client
        .unwrap()
        .paymaster()
        .find_unique(paymaster::id::equals(query.id))
        .exec()
        .await?;

    // If the paymaster is not found, return a 404.
    let paymaster = paymaster.ok_or(AppError::NotFound)?;

    // Change the paymaster to the format that the API expects.
    let paymaster: Paymaster = paymaster.into();

    Ok(Json::from(paymaster))
}

/// Returns a list of paymasters.
#[utoipa::path(
        get,
        path = "/paymaster/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Paymasters returned successfully", body = [Paymaster]),
            (status = 500, description = "Paymaster bad request", body = PaymasterError),
        )
    )]
#[autometrics]
async fn v1_paymaster_list_handler(
    pagination: Query<ListQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Vec<Paymaster>> {
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
    let paymasters: Vec<Paymaster> = paymasters.into_iter().map(Paymaster::from).collect();

    Ok(Json::from(paymasters))
}
