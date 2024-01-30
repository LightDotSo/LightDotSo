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

use crate::routes::interpretation::types::Interpretation;
use lightdotso_prisma::simulation;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Simulation root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Simulation {
    /// The id of the simulation to read for.
    id: String,
    /// The block number of the simulation.
    block_number: i32,
    /// The amount of gas used in the simulation.
    gas_used: i64,
    /// Flag of whether the simulation is successful.
    success: bool,
    /// The state of the simulation.
    status: String,
    /// The interpretation of the simulation.
    interpretation: Option<Interpretation>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<simulation::Data> for Simulation.
impl From<simulation::Data> for Simulation {
    fn from(simulation: simulation::Data) -> Self {
        Self {
            id: simulation.id,
            block_number: simulation.block_number,
            gas_used: simulation.gas_used,
            success: simulation.success,
            status: simulation.status.to_string(),
            interpretation: simulation.interpretation.map(|int| Interpretation::from(*int)),
        }
    }
}
