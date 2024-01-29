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
