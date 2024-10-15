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

#[allow(unused_imports)]
use super::{error::PaymasterError, types::Paymaster};
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first paymaster to return.
    pub offset: Option<i64>,
    /// The maximum number of paymasters to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// List paymasters
///
/// Returns a list of paymasters with optional filtering.
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
pub(crate) async fn v1_paymaster_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Paymaster>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the paymasters from the database.
    let paymasters = state
        .client
        .paymaster()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the paymasters to the format that the API expects.
    let paymasters: Vec<Paymaster> = paymasters.into_iter().map(Paymaster::from).collect();

    Ok(Json::from(paymasters))
}
