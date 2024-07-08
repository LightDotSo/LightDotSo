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
    adapter::Adapter,
    constants::{InterpretationActionType, ERC721_ABI, TRANSFER_EVENT_TOPIC},
    types::{
        AdapterResponse, AssetChange, AssetToken, AssetTokenType, InterpretationAction,
        InterpretationRequest,
    },
};
use async_trait::async_trait;
use ethers_main::{abi::Address, contract::BaseContract, types::U256};
use eyre::Result;
use lightdotso_simulator::evm::Evm;

#[derive(Clone)]
pub(crate) struct ERC721Adapter {
    abi: BaseContract,
}

impl ERC721Adapter {
    pub fn new() -> Self {
        let erc20_abi: BaseContract = ERC721_ABI.clone();
        ERC721Adapter { abi: erc20_abi }
    }
}

#[async_trait]
impl Adapter for ERC721Adapter {
    fn matches(&self, request: InterpretationRequest) -> bool {
        request
            .logs
            .iter()
            .any(|log| log.topics.len() == 4 && log.topics[0] == *TRANSFER_EVENT_TOPIC)
    }
    async fn query(
        &self,
        _evm: &mut Evm,
        _request: InterpretationRequest,
    ) -> Result<AdapterResponse> {
        // Get all the logs that match the transfer event
        let logs = _request
            .logs
            .iter()
            .filter(|log| log.topics.len() == 4 && log.topics[0] == *TRANSFER_EVENT_TOPIC)
            .collect::<Vec<_>>();

        let mut actions = Vec::new();
        let mut asset_changes = Vec::new();

        // Iterate over the logs
        for log in logs {
            // Get the `from` and `to` addresses from the log
            let (from, to, id): (Address, Address, U256) =
                self.abi.decode_event("Transfer", log.clone().topics, log.clone().data)?;

            // Get the asset token
            let token_address = log.address;

            // Get the actions for the `from` address
            let from_action_type = if from == Address::zero() {
                InterpretationActionType::ERC721Mint
            } else {
                InterpretationActionType::ERC721Send
            };
            let from_action =
                InterpretationAction { action_type: from_action_type, address: Some(from) };

            // Get the actions for the `to` address
            let to_action_type = if to == Address::zero() {
                InterpretationActionType::ERC721Burn
            } else {
                InterpretationActionType::ERC721Receive
            };
            let to_action = InterpretationAction { action_type: to_action_type, address: Some(to) };

            // Get the asset changes for the `from` address
            let from_asset_change = AssetChange {
                address: from,
                action: from_action.clone(),
                token: AssetToken {
                    address: token_address,
                    token_id: Some(id),
                    token_type: AssetTokenType::Erc721,
                },
                before_amount: Some(1.into()),
                after_amount: Some(0.into()),
                amount: 1.into(),
            };

            // Get the asset changes for the `to` address
            let to_asset_change = AssetChange {
                address: to,
                action: to_action.clone(),
                token: AssetToken {
                    address: token_address,
                    token_id: Some(id),
                    token_type: AssetTokenType::Erc721,
                },
                before_amount: Some(0.into()),
                after_amount: Some(1.into()),
                amount: 0.into(),
            };

            // Add the actions and asset changes to the vectors
            actions.push(from_action);
            actions.push(to_action);

            // Add the asset changes to the vector
            asset_changes.push(from_asset_change);
            asset_changes.push(to_asset_change);
        }

        Ok(AdapterResponse { actions, asset_changes })
    }
}
