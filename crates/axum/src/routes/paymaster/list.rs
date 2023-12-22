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

use super::types::Paymaster;
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
pub(crate) async fn v1_paymaster_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Paymaster>> {
    // Get the list query.
    let Query(query) = list_query;

    // Get the paymasters from the database.
    let paymasters = state
        .client
        .paymaster()
        .find_many(vec![])
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // Change the paymasters to the format that the API expects.
    let paymasters: Vec<Paymaster> = paymasters.into_iter().map(Paymaster::from).collect();

    Ok(Json::from(paymasters))
}
