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

#![allow(clippy::unwrap_used)]

use crate::{
    adapter::Adapter,
    constants::InterpretationActionType,
    types::{
        AdapterResponse, AssetChange, AssetToken, AssetTokenType, InterpretationAction,
        InterpretationRequest,
    },
};
use async_trait::async_trait;
use ethers_main::types::Address;
use eyre::Result;
use lightdotso_simulator::evm::Evm;

#[derive(Clone)]
pub(crate) struct EthAdapter {}

impl EthAdapter {
    pub fn new() -> Self {
        EthAdapter {}
    }
}

#[async_trait]
impl Adapter for EthAdapter {
    fn matches(&self, request: InterpretationRequest) -> bool {
        // If the request has a value larger than 0, then it is a native transfer
        request.value.map_or(false, |v| v > 0) ||
        // If the traces have a value larger than 0, then it is a native transfer
            request.traces.iter().any(|t| t.value.map_or(false, |v| v > 0.into()))
    }
    async fn query(
        &self,
        evm: &mut Evm,
        request: InterpretationRequest,
    ) -> Result<AdapterResponse> {
        let token = AssetToken {
            address: Address::zero(),
            token_id: None,
            token_type: AssetTokenType::Erc20,
        };

        // Get all the traces w/ call type
        let traces: Vec<_> = request.traces.iter().filter(|t| t.value.is_some()).collect();

        let mut actions = vec![];
        let mut asset_changes = vec![];

        for trace in traces.clone() {
            // Get the before balances
            let before_from_balance = evm.get_balance(trace.from).await?;
            let before_to_balance = evm.get_balance(trace.to).await?;

            // Get the after balances
            // unwrap is safe because we know that value is Some in the matches function
            let after_from_balance = before_from_balance - trace.value.unwrap();
            let after_to_balance = before_to_balance + trace.value.unwrap();

            // Get the actions for the from address
            let from_action = InterpretationAction {
                action_type: InterpretationActionType::NativeSend,
                address: Some(trace.from),
            };

            // Get the actions for the to address
            let to_action = InterpretationAction {
                action_type: InterpretationActionType::NativeReceive,
                address: Some(trace.to),
            };

            // Get the asset changes for the from address
            let from_asset_change = AssetChange {
                address: trace.from,
                action: from_action.clone(),
                token: token.clone(),
                before_amount: Some(before_from_balance),
                after_amount: Some(after_from_balance),
                amount: trace.value.unwrap(),
            };

            // Get the asset changes for the to address
            let to_asset_change = AssetChange {
                address: trace.to,
                action: to_action.clone(),
                token: token.clone(),
                before_amount: Some(before_to_balance),
                after_amount: Some(after_to_balance),
                amount: trace.value.unwrap(),
            };

            // Add the actions and asset changes to the vectors
            actions.push(from_action);
            actions.push(to_action);

            // Add the asset changes to the vector
            asset_changes.push(from_asset_change);
            asset_changes.push(to_asset_change);
        }

        // If the to/from address is not in the traces, then it is in the request
        if !traces.iter().any(|t| t.from == request.from && Some(t.to) == request.to) {
            // Get the before balances
            let before_from_balance = evm.get_balance(request.from).await.ok();
            let before_to_balance = evm.get_balance(request.to.unwrap()).await.ok();

            // Get the after balances
            // unwrap is safe because we know that value is Some in the matches function
            let after_from_balance = if let Some(balance) = before_from_balance {
                Some(balance - request.value.unwrap())
            } else {
                None
            };
            let after_to_balance = if let Some(balance) = before_to_balance {
                Some(balance + request.value.unwrap())
            } else {
                None
            };

            // Get the actions for the from address
            let from_action = InterpretationAction {
                action_type: InterpretationActionType::NativeSend,
                address: Some(request.from),
            };

            // Get the actions for the to address
            let to_action = InterpretationAction {
                action_type: InterpretationActionType::NativeReceive,
                address: Some(request.to.unwrap()),
            };

            // Get the asset changes for the from address
            let from_asset_change = AssetChange {
                address: request.from,
                action: from_action.clone(),
                token: token.clone(),
                before_amount: before_from_balance,
                after_amount: after_from_balance,
                amount: request.value.unwrap().into(),
            };

            // Get the asset changes for the to address
            let to_asset_change = AssetChange {
                address: request.to.unwrap(),
                action: to_action.clone(),
                token: token.clone(),
                before_amount: before_to_balance,
                after_amount: after_to_balance,
                amount: request.value.unwrap().into(),
            };

            // Add the actions and asset changes to the vectors
            actions.push(from_action);
            actions.push(to_action);

            // Add the asset changes to the vector
            asset_changes.push(from_asset_change);
            asset_changes.push(to_asset_change);
        }

        // Return the adapter response
        Ok(AdapterResponse { actions, asset_changes })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_value_none() {
        let eth_adapter = EthAdapter::new();

        let request = InterpretationRequest { value: None, ..Default::default() };

        // Assume that the matches function returns false if value is None
        assert!(!eth_adapter.matches(request));
    }

    #[test]
    fn test_check_value_greater_than_zero() {
        let eth_adapter = EthAdapter::new();

        let request = InterpretationRequest { value: Some(10), ..Default::default() };

        // Assume that the matches function returns true if value is greater than 0
        assert!(eth_adapter.matches(request));
    }
}
