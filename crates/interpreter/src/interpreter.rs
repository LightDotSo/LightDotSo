// Copyright 2023-2024 Light
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

// From: https://github.com/EnsoFinance/transaction-simulator/blob/64fe96afd52e5ff138ea0c22ad23aa4287346e7c/src/evm.rs
// License: MIT

use crate::{
    adapter::Adapter,
    adapters::ADAPTERS,
    config::InterpreterArgs,
    types::{AdapterResponse, CallTrace, InterpretationRequest, InterpretationResponse},
};
use eyre::{eyre, Result};
use foundry_config::Chain;
use foundry_evm::trace::{
    identifier::{EtherscanIdentifier, SignaturesIdentifier},
    CallTraceArena, CallTraceDecoder, CallTraceDecoderBuilder,
};
use lightdotso_contracts::provider::get_provider;
use lightdotso_simulator::{
    evm::Evm,
    simulator::{simulate, simulate_bundle},
    types::SimulationRequest,
};
use revm::interpreter::InstructionResult;

pub struct Interpreter<'a> {
    adapters: &'a [Box<dyn Adapter + Sync + Send>],
    decoder: CallTraceDecoder,
    etherscan_identifier: Option<EtherscanIdentifier>,
}

impl Interpreter<'_> {
    pub async fn new(args: &InterpreterArgs, chain_id: u64) -> Self {
        let foundry_config = foundry_config::Config {
            etherscan_api_key: args.clone().etherscan_key,
            ..Default::default()
        };

        let chain: Chain = chain_id.into();
        let etherscan_identifier = EtherscanIdentifier::new(&foundry_config, Some(chain)).ok();
        let mut decoder = CallTraceDecoderBuilder::new().with_verbosity(5).build();

        if let Ok(identifier) =
            SignaturesIdentifier::new(foundry_config::Config::foundry_cache_dir(), false)
        {
            decoder.add_signature_identifier(identifier);
        }

        let adapters = &ADAPTERS[..];

        Interpreter { decoder, etherscan_identifier, adapters }
    }

    pub async fn interpret(&self, request: InterpretationRequest) -> Result<Vec<AdapterResponse>> {
        let fork_url = get_provider(request.chain_id).await?.url().to_string();
        let mut evm = Evm::new(None, fork_url, request.block_number, request.gas_limit, true).await;
        let mut response = vec![];

        for adapter in self.adapters {
            if adapter.matches(request.clone()) {
                let query_res = adapter.query(&mut evm, request.clone()).await?;
                response.push(query_res);
            }
        }

        Ok(response)
    }

    pub async fn format_trace(&mut self, traces: Option<CallTraceArena>) -> Result<String> {
        let mut output = String::new();
        for trace in &mut traces.clone() {
            if let Some(identifier) = &mut self.etherscan_identifier {
                self.decoder.identify(trace, identifier);
            }
            self.decoder.decode(trace).await;
            output.push_str(format!("{trace}").as_str());
        }
        Ok(output)
    }

    pub async fn run_with_interpret(
        &mut self,
        request: InterpretationRequest,
    ) -> Result<InterpretationResponse> {
        // Run the interpreter
        let interpretation = self.interpret(request.clone()).await?;

        // Flatten the actions
        let actions = interpretation.clone().into_iter().flat_map(|res| res.actions).collect();

        // Flatten the asset changes
        let asset_changes = interpretation.into_iter().flat_map(|res| res.asset_changes).collect();

        Ok(InterpretationResponse {
            chain_id: request.chain_id,
            gas_used: 0,
            block_number: request.block_number.unwrap_or(0),
            success: true,
            traces: request.traces,
            logs: request.logs,
            exit_reason: InstructionResult::Stop,
            actions,
            asset_changes,
        })
    }

    pub async fn run_with_simulate(
        &mut self,
        request: SimulationRequest,
    ) -> Result<InterpretationResponse> {
        // Simulate the user operation
        let res = simulate(request.clone()).await?;

        // Run the interpreter
        let _format_trace = self.format_trace(res.arena.clone()).await?;

        // Get the traces
        let traces: Vec<CallTrace> =
            res.clone().arena.unwrap_or_default().arena.into_iter().map(CallTrace::from).collect();

        // Construct the interpretation request
        let req = InterpretationRequest {
            block_number: request.block_number,
            gas_limit: request.gas_limit,
            from: request.from,
            to: Some(request.to),
            chain_id: request.chain_id,
            call_data: request.data,
            value: request.value,
            traces: traces.clone(),
            logs: res.clone().logs,
        };

        // Run the interpreter
        let interpretation = self.interpret(req).await?;

        // Flatten the actions
        let actions = interpretation.clone().into_iter().flat_map(|res| res.actions).collect();

        // Flatten the asset changes
        let asset_changes = interpretation.into_iter().flat_map(|res| res.asset_changes).collect();

        Ok(InterpretationResponse {
            chain_id: request.chain_id,
            gas_used: res.gas_used,
            block_number: res.block_number,
            success: res.success,
            traces,
            logs: res.logs,
            exit_reason: res.exit_reason,
            actions,
            asset_changes,
        })
    }

    pub async fn run_with_simulate_bundle(
        &mut self,
        requests: Vec<SimulationRequest>,
    ) -> Result<InterpretationResponse> {
        // Simulate the user operation
        let simulation_results = simulate_bundle(requests.clone()).await?;

        // Prepare a vector to hold the InterpretationResponse objects
        let mut interpretation_responses = Vec::new();

        // For each simulation result, run the interpreter
        for (idx, res) in simulation_results.into_iter().enumerate() {
            // Get the corresponding request
            let req =
                requests.get(idx).ok_or(eyre!("No matching request for simulation result"))?;

            // Run the formatter
            let _format_trace = self.format_trace(res.arena.clone()).await?;

            // Get the traces
            let traces: Vec<CallTrace> = res
                .clone()
                .arena
                .unwrap_or_default()
                .arena
                .into_iter()
                .map(CallTrace::from)
                .collect();

            // Construct the interpretation request
            let req = InterpretationRequest {
                block_number: req.block_number,
                gas_limit: req.gas_limit,
                from: req.from,
                to: Some(req.to),
                chain_id: req.chain_id,
                call_data: req.data.clone(),
                value: req.value,
                traces: traces.clone(),
                logs: res.clone().logs,
            };

            // Run the interpreter
            let interpretation = self.interpret(req.clone()).await?;

            // Flatten the actions
            let actions = interpretation.clone().into_iter().flat_map(|res| res.actions).collect();

            // Flatten the asset changes
            let asset_changes =
                interpretation.into_iter().flat_map(|res| res.asset_changes).collect();

            // Push the interpretation response to the vector
            interpretation_responses.push(InterpretationResponse {
                chain_id: req.chain_id,
                gas_used: res.gas_used,
                block_number: res.block_number,
                success: res.success,
                traces,
                logs: res.logs,
                exit_reason: res.exit_reason,
                actions,
                asset_changes,
            });
        }

        // Flatten the vector to single InterpretationResponse
        let res = interpretation_responses.clone().into_iter().fold(
            InterpretationResponse::default(),
            |mut acc, res| {
                acc.chain_id = res.chain_id;
                acc.block_number = res.block_number;
                acc.success &= res.success;
                acc.gas_used += res.gas_used;
                acc.success &= res.success;
                acc.traces.extend(res.traces);
                acc.logs.extend(res.logs);
                acc.exit_reason = res.exit_reason;
                acc.actions.extend(res.actions);
                acc.asset_changes.extend(res.asset_changes);
                acc
            },
        );

        // Make sure the chain_id and block_number are added
        let res = InterpretationResponse {
            chain_id: requests.first().map(|req| req.chain_id).unwrap_or_default(),
            block_number: interpretation_responses
                .last()
                .map(|res| res.block_number)
                .unwrap_or_default(),
            success: interpretation_responses.iter().all(|res| res.success),
            ..res
        };

        Ok(res)
    }
}
