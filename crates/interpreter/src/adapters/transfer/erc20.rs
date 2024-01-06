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
    adapter::Adapter,
    constants::TRANSFER_EVENT_TOPIC,
    types::{AdapterResponse, InterpretationRequest},
};
use async_trait::async_trait;
use ethers_main::{abi::parse_abi, contract::BaseContract};
use eyre::Result;
use lightdotso_simulator::evm::Evm;

#[derive(Clone)]
pub(crate) struct ERC20Adapter {}

impl ERC20Adapter {
    pub fn new() -> Self {
        ERC20Adapter {}
    }
}

#[async_trait]
impl Adapter for ERC20Adapter {
    fn matches(&self, request: InterpretationRequest) -> bool {
        request
            .logs
            .iter()
            .any(|log| log.topics.len() == 3 && log.topics[0] == *TRANSFER_EVENT_TOPIC)
    }
    async fn query(
        &self,
        evm: &mut Evm,
        request: InterpretationRequest,
    ) -> Result<AdapterResponse> {
        // Get all the logs that match the ERC20 Transfer event
        let logs = request
            .logs
            .iter()
            .filter(|log| log.topics.len() == 3 && log.topics[0] == *TRANSFER_EVENT_TOPIC)
            .collect::<Vec<_>>();

        // Get all of the address of the token contract from the matching logs
        let token_addresses =
            logs.iter().map(|log| log.address).collect::<std::collections::HashSet<_>>();

        let erc20_abi = BaseContract::from(parse_abi(&[
            "function balanceOf(address) external view returns (uint256)",
        ])?);

        // For each token address, get the before balances
        for token_address in token_addresses {
            let calldata = erc20_abi.encode("balanceOf", request.from)?;
            let res =
                evm.call_raw(request.from, token_address, Some(0.into()), Some(calldata)).await?;
            println!("res: {:?}", res);
        }

        Ok(AdapterResponse { actions: vec![], asset_changes: vec![] })
    }
}
