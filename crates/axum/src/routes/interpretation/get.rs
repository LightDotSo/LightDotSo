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

/// Get a interpretation
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
