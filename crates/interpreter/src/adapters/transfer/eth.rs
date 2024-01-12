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

#![allow(clippy::unwrap_used)]

use crate::{
    adapter::Adapter,
    constants::InterpretationActionType,
    types::{
        AdapterResponse, AssetChange, AssetToken, InterpretationAction, InterpretationRequest,
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
        let token = AssetToken { address: Address::zero(), token_id: None };

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
