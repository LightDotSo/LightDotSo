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

use crate::{adapter::Adapter, types::InterpretationRequest};
use async_trait::async_trait;
use eyre::Result;

#[derive(Clone)]
pub(crate) struct ERC721Adapter {}

impl ERC721Adapter {
    pub fn new() -> Self {
        ERC721Adapter {}
    }
}

#[async_trait]
impl Adapter for ERC721Adapter {
    fn matches(&self, _request: InterpretationRequest) -> bool {
        true
    }
    async fn query(&self, _request: InterpretationRequest) -> Result<()> {
        Ok(())
    }
}
