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
use eyre::{eyre, Result};
use futures::executor::block_on;
use lightdotso_simulator::types::SimulationRequest;
use lightdotso_tracing::tracing::info;
use std::panic::{self, AssertUnwindSafe};

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

        // Interpret the user operation
        let result = panic::catch_unwind(AssertUnwindSafe(|| {
            block_on(async { interpreter.run_with_simulate_bundle(requests).await })
        }));

        // Handle the result of the panic catch
        match result {
            Ok(Ok(res)) => {
                // Log the result
                info!("res: {:?}", res);
                // Log the end of the operation
                info!("InterpreterArgs run, finished");
                Ok(res)
            }
            Ok(Err(e)) => Err(e),
            Err(_) => Err(eyre!("Panic occurred")),
        }
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
        let result = panic::catch_unwind(AssertUnwindSafe(|| {
            block_on(async { interpreter.run_with_interpret(request).await })
        }));

        // Handle the result of the panic catch
        match result {
            Ok(Ok(res)) => {
                // Log the result
                info!("res: {:?}", res);
                // Log the end of the operation
                info!("InterpreterArgs run, finished");
                Ok(res)
            }
            Ok(Err(e)) => Err(e),
            Err(_) => Err(eyre!("Panic occurred")),
        }
    }
}
