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

// From: https://github.com/EnsoFinance/transaction-simulator/blob/64fe96afd52e5ff138ea0c22ad23aa4287346e7c/src/evm.rs
// License: MIT

use crate::{
    adapter::Adapter,
    config::InterpreterArgs,
    constants::ADAPTERS,
    types::{CallTrace, InterpretationRequest, InterpretationResponse},
};
use eyre::Result;
use foundry_config::Chain;
use foundry_evm::trace::{
    identifier::{EtherscanIdentifier, SignaturesIdentifier},
    CallTraceArena, CallTraceDecoder, CallTraceDecoderBuilder,
};
use lightdotso_contracts::provider::get_provider;
use lightdotso_simulator::{evm::Evm, simulator::simulate, types::SimulationRequest};

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

    pub async fn interpret(&self, request: InterpretationRequest) -> Result<()> {
        let fork_url = get_provider(request.chain_id).await?.url().to_string();
        let mut evm = Evm::new(None, fork_url, request.block_number, request.gas_limit, true).await;

        for adapter in self.adapters {
            if adapter.matches(request.clone()) {
                adapter.query(&mut evm, request.clone()).await?;
            }
        }

        Ok(())
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

    pub async fn run_with_simulate(
        &mut self,
        request: SimulationRequest,
    ) -> Result<InterpretationResponse> {
        // Simulate the user operation
        let res = simulate(request).await?;

        // Run the interpreter
        let format_trace = self.format_trace(res.arena.clone()).await?;

        let traces = res.arena.unwrap_or_default().arena.into_iter().map(CallTrace::from).collect();

        Ok(InterpretationResponse {
            gas_used: res.gas_used,
            block_number: res.block_number,
            success: res.success,
            traces,
            logs: res.logs,
            exit_reason: res.exit_reason,
            formatted_trace: format_trace,
        })
    }
}
