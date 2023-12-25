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

use crate::traits::ToJson;
use ethers::{types::H160, utils::to_checksum};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct CovalentMessage {
    pub address: H160,
    pub chain_id: u64,
}

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

impl ToJson for CovalentMessage {
    fn to_json(&self) -> String {
        let msg_value: Value = json!({
            "address": to_checksum(&self.address, None),
            "chain_id": &self.chain_id,
        });

        msg_value.to_string()
    }
}
