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

use super::types::Simulation;
use crate::{
    error::RouteError, result::AppJsonResult, routes::simulation::error::SimulationError,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{asset_change, interpretation, simulation};
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
    /// The id of the simulation to get.
    pub simulation_id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a simulation
#[utoipa::path(
        get,
        path = "/simulation/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Simulation returned successfully", body = Simulation),
            (status = 404, description = "Simulation not found", body = SimulationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_simulation_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Simulation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get simulation for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the simulations from the database.
    let simulation = state
        .client
        .simulation()
        .find_unique(simulation::id::equals(query.simulation_id))
        .with(
            simulation::interpretation::fetch().with(interpretation::actions::fetch(vec![])).with(
                interpretation::asset_changes::fetch(vec![])
                    .with(asset_change::interpretation_action::fetch())
                    .with(asset_change::token::fetch()),
            ),
        )
        .exec()
        .await?;

    // If the simulation is not found, return a 404.
    let simulation = simulation.ok_or(RouteError::SimulationError(SimulationError::NotFound(
        "Simulation not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the simulation to the format that the API expects.
    let simulation: Simulation = simulation.into();

    Ok(Json::from(simulation))
}
