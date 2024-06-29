// Copyright 2023-2024 Light.
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
    constants::{InterpretationActionType, ERC20_ABI, TRANSFER_EVENT_TOPIC},
    types::{
        AdapterResponse, AssetChange, AssetToken, AssetTokenType, InterpretationAction,
        InterpretationRequest,
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
use lightdotso_tracing::tracing::info;

#[derive(Clone)]
pub(crate) struct ERC20Adapter {
    abi: BaseContract,
}

impl ERC20Adapter {
    pub fn new() -> Self {
        let erc20_abi: BaseContract = ERC20_ABI.clone();
        ERC20Adapter { abi: erc20_abi }
    }

    pub async fn get_erc20_balance(
        &self,
        evm: &mut Evm,
        address: H160,
        token_address: H160,
    ) -> Result<U256> {
        // Encode the method and parameters to call
        let calldata = self.abi.encode("balanceOf", address)?;

        // Call the contract method
        let res = evm.call_raw(address, token_address, Some(0.into()), Some(calldata)).await?;

        // Decode the output
        let balance: U256 = self.abi.decode_output("balanceOf", res.return_data)?;

        // Return the balance
        Ok(balance)
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
        info!("logs: {:?}", logs);

        let mut actions = Vec::new();
        let mut asset_changes = Vec::new();

        // Iterate over all of the logs
        for log in logs {
            // Get the `from` and `to` addresses from the log
            let (from, to, value): (Address, Address, U256) =
                self.abi.decode_event("Transfer", log.clone().topics, log.clone().data)?;

            // Get the token address from the log
            let token_address = log.address;

            // Get the token balance of the `from` address
            let mut before_from_balance =
                self.get_erc20_balance(evm, from, token_address).await.ok();

            // Get the token balance of the `to` address
            let mut before_to_balance = self.get_erc20_balance(evm, to, token_address).await.ok();

            // Check if the value does not overflow
            let (after_from_balance, after_to_balance) = before_from_balance
                .and_then(|before_balance| {
                    if value <= before_balance {
                        Some((Some(before_balance - value), before_to_balance.map(|b| b + value)))
                    } else {
                        // If the value overflows, set the before balances to `None`
                        before_from_balance = None;
                        before_to_balance = None;

                        None
                    }
                })
                .unwrap_or((None, None));

            // Get the after balance of the `to` address

            // Get the actions for the `from` address
            let from_action = InterpretationAction {
                action_type: InterpretationActionType::ERC20Send,
                address: Some(from),
            };

            // Get the actions for the `to` address
            let to_action = InterpretationAction {
                action_type: InterpretationActionType::ERC20Receive,
                address: Some(to),
            };

            // Get the asset changes for the `from` address
            let from_asset_change = AssetChange {
                address: from,
                action: from_action.clone(),
                token: AssetToken {
                    address: token_address,
                    token_id: None,
                    token_type: AssetTokenType::Erc20,
                },
                before_amount: before_from_balance,
                after_amount: after_from_balance,
                amount: value,
            };

            // Get the asset changes for the `to` address
            let to_asset_change = AssetChange {
                address: to,
                action: to_action.clone(),
                token: AssetToken {
                    address: token_address,
                    token_id: None,
                    token_type: AssetTokenType::Erc20,
                },
                before_amount: before_to_balance,
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

        Ok(AdapterResponse { actions, asset_changes })
    }
}
