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

use super::types::Interpretation;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{asset_change, interpretation};
use prisma_client_rust::Direction;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first interpretation to return.
    pub offset: Option<i64>,
    /// The maximum number of interpretations to return.
    pub limit: Option<i64>,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of interpretations
#[utoipa::path(
        get,
        path = "/interpretation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Interpretations returned successfully", body = [Interpretation]),
            (status = 500, description = "Interpretations bad request", body = InterpretationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Interpretation>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretations from the database.
    let interpretations = state
        .client
        .interpretation()
        .find_many(vec![])
        .order_by(interpretation::created_at::order(Direction::Desc))
        .with(interpretation::actions::fetch(vec![]))
        .with(
            interpretation::asset_changes::fetch(vec![])
                .with(asset_change::interpretation_action::fetch())
                .with(asset_change::token::fetch()),
        )
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the interpretations to the format that the API expects.
    let interpretations: Vec<Interpretation> =
        interpretations.into_iter().map(Interpretation::from).collect();

    Ok(Json::from(interpretations))
}
