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
    types::{AdapterResponse, AssetChange, AssetToken, InterpretationRequest},
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
        // If the calldata is empty, it's a value transfer
        request.call_data.filter(|data| !data.is_empty()).is_none() && request.value.is_some()
    }
    async fn query(
        &self,
        evm: &mut Evm,
        request: InterpretationRequest,
    ) -> Result<AdapterResponse> {
        let token = AssetToken { address: Address::zero(), token_id: None };

        let before_from_balance = evm.get_balance(request.from).await?;
        let before_to_balance = evm.get_balance(request.to).await?;

        // Get the after balances
        // unwrap is safe because we know that value is Some in the matches function
        let after_from_balance = before_from_balance - request.value.unwrap();
        let after_to_balance = before_to_balance + request.value.unwrap();

        let from_asset_change = AssetChange {
            address: request.from,
            token: token.clone(),
            before_amount: before_from_balance,
            after_amount: after_from_balance,
            amount: request.value.unwrap().into(),
        };

        let to_asset_change = AssetChange {
            address: request.to,
            token: token.clone(),
            before_amount: before_to_balance,
            after_amount: after_to_balance,
            amount: request.value.unwrap().into(),
        };
        Ok(AdapterResponse { asset_changes: vec![from_asset_change, to_asset_change] })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_call_data_with_empty() {
        let eth_adapter = EthAdapter::new();

        let request = InterpretationRequest {
            call_data: Some(vec![].into()),
            value: Some(1),
            ..Default::default()
        };

        // Assume that the check_call_data function returns true if call_data is empty and value is
        // not None
        assert!(eth_adapter.matches(request));
    }

    #[test]
    fn test_check_call_data_with_data() {
        let eth_adapter = EthAdapter::new();

        let request =
            InterpretationRequest { call_data: Some(vec![1, 2, 3].into()), ..Default::default() };

        // Assume that the check_call_data function returns false if call_data is not empty
        assert!(!eth_adapter.matches(request));
    }

    #[test]
    fn test_check_call_data_with_none() {
        let eth_adapter = EthAdapter::new();

        let request = InterpretationRequest::default();

        // Assume that the check_call_data function returns true if call_data and value is None
        assert!(!eth_adapter.matches(request));
    }
}
