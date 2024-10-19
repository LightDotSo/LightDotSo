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

use super::{error::SimulationError, types::Simulation};
use crate::result::AppJsonResult;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{
    asset_change, interpretation,
    simulation::{self, WhereParam},
};
use lightdotso_state::ClientState;
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

/// Returns a list of simulations
///
/// Returns a list of simulations with optional filtering.
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
    State(state): State<ClientState>,
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
        .with(
            simulation::interpretation::fetch().with(interpretation::actions::fetch(vec![])).with(
                interpretation::asset_changes::fetch(vec![])
                    .with(asset_change::interpretation_action::fetch())
                    .with(asset_change::token::fetch()),
            ),
        )
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

/// Returns a count of list of simulations
///
/// Returns a count of simulations with optional filtering.
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
    State(state): State<ClientState>,
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
