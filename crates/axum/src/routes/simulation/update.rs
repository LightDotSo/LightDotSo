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
pub(crate) struct SimulationUpdateRequestParams {
    /// The array of the simulations to query.
    pub simulations: Vec<SimulationUpdateRequest>,
}

/// Item to request.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct SimulationUpdateRequest {
    /// The id of the simulation to update for.
    id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update a list of simulations
#[utoipa::path(
        post,
        path = "/simulation/update",
        request_body = SimulationUpdateRequestParams,
        responses(
            (status = 200, description = "Simulation created successfully", body = i64),
            (status = 500, description = "Simulation internal error", body = SimulationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_simulation_update_handler(
    State(state): State<AppState>,
    Json(params): Json<SimulationUpdateRequestParams>,
) -> AppJsonResult<i64> {
    // Get the simulation from the post body.
    let simulations = params.simulations;

    // Create the simulation the database.
    let simulations = state
        .client
        .simulation()
        .update_many(
            vec![lightdotso_prisma::simulation::id::contains(
                simulations.iter().map(|simulation| simulation.clone().id).collect(),
            )],
            vec![],
        )
        .exec()
        .await?;
    info!(?simulations);

    Ok(Json::from(simulations))
}
