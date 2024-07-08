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
