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

use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{extract::State, Json};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct InterpretationUpdateRequestParams {
    /// The array of the interpretations to query.
    pub interpretations: Vec<InterpretationUpdateRequest>,
}

/// Item to request.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct InterpretationUpdateRequest {
    /// The id of the interpretation to update for.
    id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update a list of interpretations
#[utoipa::path(
        post,
        path = "/interpretation/update",
        request_body = InterpretationUpdateRequestParams,
        responses(
            (status = 200, description = "Interpretation created successfully", body = i64),
            (status = 500, description = "Interpretation internal error", body = InterpretationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_update_handler(
    State(state): State<AppState>,
    Json(params): Json<InterpretationUpdateRequestParams>,
) -> AppJsonResult<i64> {
    // Get the interpretation from the post body.
    let interpretations = params.interpretations;

    // Create the interpretation the database.
    let interpretations = state
        .client
        .interpretation()
        .update_many(
            vec![lightdotso_prisma::interpretation::id::contains(
                interpretations.iter().map(|interpretation| interpretation.clone().id).collect(),
            )],
            vec![],
        )
        .exec()
        .await?;
    info!(?interpretations);

    Ok(Json::from(interpretations))
}
