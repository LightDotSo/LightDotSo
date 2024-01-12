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
    constants::{
        InterpretationActionType, ERC1155_ABI, TRANSFER_BATCH_EVENT_TOPIC,
        TRANSFER_SINGLE_EVENT_TOPIC,
    },
    types::{
        AdapterResponse, AssetChange, AssetToken, InterpretationAction, InterpretationRequest,
    },
};
use async_trait::async_trait;
use ethers_main::{
    abi::Address,
    contract::BaseContract,
    types::{H160, U256},
};
use eyre::Result;
use lightdotso_simulator::evm::Evm;

#[derive(Clone)]
pub(crate) struct ERC1155Adapter {
    abi: BaseContract,
}

impl ERC1155Adapter {
    pub fn new() -> Self {
        let erc1155_abi: BaseContract = ERC1155_ABI.clone();
        ERC1155Adapter { abi: erc1155_abi }
    }
    pub async fn get_erc1155_balance(
        &self,
        evm: &mut Evm,
        address: H160,
        token_id: U256,
        token_address: H160,
    ) -> Result<U256> {
        // Encode the method and parameters to call
        let calldata = self.abi.encode("balanceOf", (address, token_id))?;

        // Call the contract method
        let res = evm.call_raw(address, token_address, Some(0.into()), Some(calldata)).await?;

        // Decode the output
        let balance: U256 = self.abi.decode_output("balanceOf", res.return_data)?;

        // Return the balance
        Ok(balance)
    }
}

#[async_trait]
impl Adapter for ERC1155Adapter {
    fn matches(&self, request: InterpretationRequest) -> bool {
        request.logs.iter().any(|log| {
            log.topics.len() == 4 &&
                (log.topics[0] == *TRANSFER_SINGLE_EVENT_TOPIC ||
                    log.topics[0] == *TRANSFER_BATCH_EVENT_TOPIC)
        })
    }

    async fn query(
        &self,
        evm: &mut Evm,
        _request: InterpretationRequest,
    ) -> Result<AdapterResponse> {
        // Get all the logs that match the transfer event
        let single_logs = _request
            .logs
            .iter()
            .filter(|log| log.topics.len() == 4 && log.topics[0] == *TRANSFER_SINGLE_EVENT_TOPIC)
            .collect::<Vec<_>>();
        // Get all the logs that match the transfer event
        let batch_logs = _request
            .logs
            .iter()
            .filter(|log| log.topics.len() == 4 && log.topics[0] == *TRANSFER_BATCH_EVENT_TOPIC)
            .collect::<Vec<_>>();

        let mut actions = Vec::new();
        let mut asset_changes = Vec::new();

        // Iterate over the logs
        for log in single_logs {
            // Get the `from` and `to` addresses from the log
            let (_operator, from, to, id, value): (Address, Address, Address, U256, U256) =
                self.abi.decode_event("TransferSingle", log.clone().topics, log.clone().data)?;

            // Get the asset token
            let token_address = log.address;

            // Get the asset token
            let asset_token = AssetToken { address: token_address, token_id: Some(id) };

            // Get the actions for the `from` address
            let from_action_type = if from == Address::zero() {
                InterpretationActionType::ERC1155Minted
            } else {
                InterpretationActionType::ERC1155Send
            };

            let from_action =
                InterpretationAction { action_type: from_action_type, address: Some(from) };

            // Get the actions for the `to` address
            let to_action_type = if to == Address::zero() {
                InterpretationActionType::ERC1155Burned
            } else {
                InterpretationActionType::ERC1155Receive
            };

            // Get the actions for the `to` address
            let to_action = InterpretationAction { action_type: to_action_type, address: Some(to) };

            // Get the asset changes for the `from` address
            let before_from_balance =
                &self.get_erc1155_balance(evm, from, id, token_address).await.ok();

            // Get the asset changes for the `to` address
            let before_to_balance =
                &self.get_erc1155_balance(evm, to, id, token_address).await.ok();

            // Get the after balance of the `from` address
            let after_from_balance = before_from_balance.map(|b| b - value);

            // Get the after balance of the `to` address
            let after_to_balance = before_to_balance.map(|b| b + value);

            // Get the asset changes for the `from` address
            let from_asset_change = AssetChange {
                address: from,
                action: from_action.clone(),
                token: asset_token.clone(),
                before_amount: *before_from_balance,
                after_amount: after_from_balance,
                amount: value,
            };

            // Get the asset changes for the `to` address
            let to_asset_change = AssetChange {
                address: to,
                action: to_action.clone(),
                token: asset_token.clone(),
                before_amount: *before_to_balance,
                after_amount: after_to_balance,
                amount: value,
            };

            // Add the actions and asset changes to the vectors
            actions.push(from_action);
            actions.push(to_action);

            // Add the asset changes to the vector
            asset_changes.push(from_asset_change);
            asset_changes.push(to_asset_change);
        }

        // Iterate over the logs
        for log in batch_logs {
            // Get the `from` and `to` addresses from the log
            let (_operator, from, to, ids, values): (
                Address,
                Address,
                Address,
                Vec<U256>,
                Vec<U256>,
            ) = self.abi.decode_event("TransferBatch", log.clone().topics, log.clone().data)?;

            // Get the asset token
            let token_address = log.address;

            // Get the asset token
            let asset_token = AssetToken { address: token_address, token_id: None };

            // Get the actions for the `from` address
            let from_action_type = if from == Address::zero() {
                InterpretationActionType::ERC1155Minted
            } else {
                InterpretationActionType::ERC1155Send
            };

            //  Get the actions for the `from` address
            let from_action =
                InterpretationAction { action_type: from_action_type, address: Some(from) };

            // Get the actions for the `to` address
            let to_action_type = if to == Address::zero() {
                InterpretationActionType::ERC1155Burned
            } else {
                InterpretationActionType::ERC1155Receive
            };

            // Get the actions for the `to` address
            let to_action = InterpretationAction { action_type: to_action_type, address: Some(to) };

            // Get the asset changes for the `from` address
            let mut from_asset_changes = Vec::new();

            // Get the asset changes for the `to` address
            let mut to_asset_changes = Vec::new();

            for (id, value) in ids.iter().zip(values.iter()) {
                // Get the before balances
                let before_from_balance =
                    &self.get_erc1155_balance(evm, from, *id, token_address).await.ok();
                let before_to_balance =
                    &self.get_erc1155_balance(evm, to, *id, token_address).await.ok();

                // Get the after balances
                let after_from_balance = before_from_balance.map(|b| b - value);
                let after_to_balance = before_to_balance.map(|b| b + value);

                // Get the asset changes for the `from` address
                let from_asset_change = AssetChange {
                    address: from,
                    action: from_action.clone(),
                    token: asset_token.clone(),
                    before_amount: *before_from_balance,
                    after_amount: after_from_balance,
                    amount: *value,
                };

                // Get the asset changes for the `to` address
                let to_asset_change = AssetChange {
                    address: to,
                    action: to_action.clone(),
                    token: asset_token.clone(),
                    before_amount: *before_to_balance,
                    after_amount: after_to_balance,
                    amount: *value,
                };

                // Add the asset changes to the vector
                from_asset_changes.push(from_asset_change);
                to_asset_changes.push(to_asset_change);

                // Add the actions and asset changes to the vectors
                actions.push(from_action.clone());
                actions.push(to_action.clone());
            }
        }

        Ok(AdapterResponse { actions, asset_changes })
    }
}
