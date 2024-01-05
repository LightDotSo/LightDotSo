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
    types::{AdapterResponse, InterpretationRequest},
};
use async_trait::async_trait;
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
        request.logs.iter().any(|log| {
            log.topics.len() == 3 &&
                log.topics[0] ==
                    // https://www.4byte.directory/event-signatures/?bytes_signature=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
                    // Transfer(address,address,uint256)
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                        .parse()
                        .unwrap()
        })
    }
    async fn query(
        &self,
        _evm: &mut Evm,
        _request: InterpretationRequest,
    ) -> Result<AdapterResponse> {
        Ok(AdapterResponse { actions: vec![], asset_changes: vec![] })
    }
}
