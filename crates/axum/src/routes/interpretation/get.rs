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
use crate::{
    error::RouteError, result::AppJsonResult, routes::interpretation::error::InterpretationError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{asset_change, interpretation};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub(crate) struct GetQuery {
    /// The id of the interpretation to get.
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get an interpretation
///
/// Gets an interpretation by id.
#[utoipa::path(
        get,
        path = "/interpretation/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Interpretation returned successfully", body = Interpretation),
            (status = 404, description = "Interpretation not found", body = InterpretationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Interpretation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get interpretation for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretations from the database.
    let interpretation = state
        .client
        .interpretation()
        .find_unique(interpretation::id::equals(query.id))
        .with(interpretation::actions::fetch(vec![]))
        .with(
            interpretation::asset_changes::fetch(vec![])
                .with(asset_change::interpretation_action::fetch())
                .with(asset_change::token::fetch()),
        )
        .exec()
        .await?;
    info!(?interpretation);

    // If the interpretation is not found, return a 404.
    let interpretation = interpretation.ok_or(RouteError::InterpretationError(
        InterpretationError::NotFound("Interpretation not found".to_string()),
    ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the interpretation to the format that the API expects.
    let interpretation: Interpretation = interpretation.into();

    Ok(Json::from(interpretation))
}
