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

use crate::{
    interpreter::Interpreter,
    types::{InterpretationRequest, InterpretationResponse},
};
use clap::Parser;
use eyre::Result;
use lightdotso_simulator::types::SimulationRequest;
use lightdotso_tracing::tracing::info;

#[derive(Debug, Clone, Parser, Default)]
pub struct InterpreterArgs {}

impl InterpreterArgs {
    pub async fn run(self, requests: Vec<SimulationRequest>) -> Result<InterpretationResponse> {
        // Add info
        info!("InterpreterArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        // Construct the interpreter
        let mut interpreter = Interpreter::new().await;

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
        let mut interpreter = Interpreter::new().await;

        info!("InterpreterArgs run, starting interpret...");

        // Interpret the user operation
        let res = interpreter.run_with_interpret(request).await?;

        info!("res: {:?}", res);

        info!("InterpreterArgs run, finished");

        Ok(res)
    }
}
