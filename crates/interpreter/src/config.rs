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

use crate::{
    interpreter::Interpreter,
    types::{InterpretationRequest, InterpretationResponse},
};
use clap::Parser;
use eyre::Result;
use lightdotso_simulator::types::SimulationRequest;
use lightdotso_tracing::tracing::info;

#[derive(Debug, Clone, Parser, Default)]
pub struct InterpreterArgs {
    /// The etherscan API key
    #[clap(long, env = "ETHERSCAN_KEYS")]
    pub etherscan_key: Option<String>,
}

impl InterpreterArgs {
    pub async fn run(self, requests: Vec<SimulationRequest>) -> Result<InterpretationResponse> {
        // Add info
        info!("InterpreterArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        // Construct the interpreter
        let mut interpreter = Interpreter::new(
            &self,
            requests.first().and_then(|request| request.block_number).unwrap_or(1),
        )
        .await;

        info!("InterpreterArgs run, starting simulate...");

        // Simulate the user operation
        let res = interpreter.run_with_simulate_bundle(requests).await?;

        info!("res: {:?}", res);

        info!("InterpreterArgs run, finished");

        Ok(res)
    }

    pub async fn run_interpretation(
        self,
        request: InterpretationRequest,
    ) -> Result<InterpretationResponse> {
        // Add info
        info!("InterpreterArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        // Construct the interpreter
        let mut interpreter = Interpreter::new(&self, request.chain_id).await;

        info!("InterpreterArgs run, starting interpret...");

        // Interpret the user operation
        let res = interpreter.run_with_interpret(request).await?;

        info!("res: {:?}", res);

        info!("InterpreterArgs run, finished");

        Ok(res)
    }
}
