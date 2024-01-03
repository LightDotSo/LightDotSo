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

use eyre::Result;
use foundry_config::Chain;
use foundry_evm::trace::{
    identifier::{EtherscanIdentifier, SignaturesIdentifier},
    CallTraceArena, CallTraceDecoder, CallTraceDecoderBuilder,
};

pub struct Intepreter {
    decoder: CallTraceDecoder,
    etherscan_identifier: Option<EtherscanIdentifier>,
}

impl Intepreter {
    pub async fn new(chain_id: u64, etherscan_key: Option<String>) -> Self {
        let foundry_config =
            foundry_config::Config { etherscan_api_key: etherscan_key, ..Default::default() };

        let chain: Chain = chain_id.into();
        let etherscan_identifier = EtherscanIdentifier::new(&foundry_config, Some(chain)).ok();
        let mut decoder = CallTraceDecoderBuilder::new().with_verbosity(5).build();

        if let Ok(identifier) =
            SignaturesIdentifier::new(foundry_config::Config::foundry_cache_dir(), false)
        {
            decoder.add_signature_identifier(identifier);
        }

        Intepreter { decoder, etherscan_identifier }
    }

    pub async fn format_trace(&mut self, traces: Vec<CallTraceArena>) -> Result<String> {
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
}
