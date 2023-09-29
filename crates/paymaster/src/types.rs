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

use std::fmt;

use ethers::{
    types::{Address, Bytes, U256},
    utils::hex,
};
use serde::{Deserialize, Serialize};

/// The paymaster and data returned by the paymaster.
pub type PaymasterAndData = Bytes;

/// The gas and paymaster and data returned by the paymaster.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GasAndPaymasterAndData {
    pub call_gas_limit: U256,
    pub verification_gas_limit: U256,
    pub pre_verification_gas: U256,
    pub max_fee_per_gas: U256,
    pub max_priority_fee_per_gas: U256,
    pub paymaster_and_data: Bytes,
}

/// User operation required for the request.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperationRequest {
    pub sender: Address,
    pub nonce: U256,
    pub init_code: Bytes,
    pub call_data: Bytes,
    pub call_gas_limit: Option<U256>,
    pub verification_gas_limit: Option<U256>,
    pub pre_verification_gas: Option<U256>,
    pub max_fee_per_gas: Option<U256>,
    pub max_priority_fee_per_gas: Option<U256>,
    pub paymaster_and_data: Option<Bytes>,
    pub signature: Bytes,
}

/// User operation required for the request.
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserOperationConstruct {
    pub sender: Address,
    pub nonce: U256,
    pub init_code: Bytes,
    pub call_data: Bytes,
    pub call_gas_limit: U256,
    pub verification_gas_limit: U256,
    pub pre_verification_gas: U256,
    pub max_fee_per_gas: U256,
    pub max_priority_fee_per_gas: U256,
    pub signature: Bytes,
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/types.rs#L27
/// License: MIT
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EstimateResult {
    pub pre_verification_gas: U256,
    pub verification_gas_limit: U256,
    pub call_gas_limit: U256,
}

impl fmt::Debug for UserOperationConstruct {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("UserOperationConstruct")
            .field("sender", &format!("{:#x}", self.sender))
            .field("nonce", &format!("{:#x}", self.nonce))
            .field("init_code", &format!("0x{}", hex::encode(&self.init_code)))
            .field("call_data", &format!("0x{}", hex::encode(&self.call_data)))
            .field("call_gas_limit", &format!("{:#x}", self.call_gas_limit))
            .field("verification_gas_limit", &format!("{:#x}", self.verification_gas_limit))
            .field("pre_verification_gas", &format!("{:#x}", self.pre_verification_gas))
            .field("max_fee_per_gas", &format!("{:#x}", self.max_fee_per_gas))
            .field("max_priority_fee_per_gas", &format!("{:#x}", self.max_priority_fee_per_gas))
            .field("signature", &format!("0x{}", hex::encode(&self.signature)))
            .finish()
    }
}
