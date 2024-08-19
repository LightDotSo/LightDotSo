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

use super::types::InterpretationAction;
use crate::{
    error::RouteError, result::AppJsonResult,
    routes::interpretation_action::error::InterpretationActionError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::interpretation_action;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The id of the interpretation action.
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a interpretation action
#[utoipa::path(
        get,
        path = "/interpretation_action/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Interpretation action returned successfully", body = InterpretationAction),
            (status = 404, description = "Interpretation action not found", body = InterpretationActionError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_action_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<InterpretationAction> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretation action from the database.
    let interpretation_action = state
        .client
        .interpretation_action()
        .find_unique(interpretation_action::id::equals(query.id))
        .exec()
        .await?;

    // If the paymaster is not found, return a 404.
    let interpretation_action =
        interpretation_action.ok_or(RouteError::InterpretationActionError(
            InterpretationActionError::NotFound("Interpretation action not found".to_string()),
        ))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the interpretation action to the format that the API expects.
    let interpretation_action: InterpretationAction = interpretation_action.into();

    Ok(Json::from(interpretation_action))
}
