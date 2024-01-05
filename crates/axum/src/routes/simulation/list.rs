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
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::simulation::{self, WhereParam};
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub(crate) struct ListQuery {
    /// The offset of the first simulation to return.
    pub offset: Option<i64>,
    /// The maximum number of simulations to return.
    pub limit: Option<i64>,
    /// The user id to filter by.
    pub id: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of simulations.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct SimulationListCount {
    /// The count of the list of simulations..
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of simulations.
#[utoipa::path(
        get,
        path = "/simulation/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Simulations returned successfully", body = [Simulation]),
            (status = 500, description = "Simulation bad request", body = SimulationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_simulation_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Simulation>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_simulation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the simulations from the database.
    let simulations = state
        .client
        .simulation()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the simulations to the format that the API expects.
    let simulations: Vec<Simulation> = simulations.into_iter().map(Simulation::from).collect();

    Ok(Json::from(simulations))
}

/// Returns a count of list of simulations.
#[utoipa::path(
        get,
        path = "/simulation/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Simulations returned successfully", body = SimulationListCount),
            (status = 500, description = "Simulation bad request", body = SimulationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_simulation_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<SimulationListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;
    info!(?query);

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_simulation_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the simulations from the database.
    let count = state.client.simulation().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(SimulationListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for simulations.
fn construct_simulation_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.id {
        Some(id) => {
            vec![simulation::id::equals(id.clone())]
        }
        None => vec![],
    };

    if let Some(id) = &query.id {
        query_exp.push(simulation::id::equals(id.clone()));
    }

    query_exp
}
