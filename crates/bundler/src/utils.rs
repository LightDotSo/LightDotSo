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

use ethers::types::{Address, U256};
use silius_uopool::Overhead;
/// Entire file is copied from https://github.com/Vid201/silius/blob/bc8b7b0039c9a2b02256fefc7eed3b2efc94bf96/bin/silius/src/utils.rs
/// License: MIT or Apache-2.0
use std::str::FromStr;

/// Parses address from string
pub fn parse_address(s: &str) -> Result<Address, String> {
    Address::from_str(s).map_err(|_| format!("String {s} is not a valid address"))
}

/// Parses U256 from string
pub fn parse_u256(s: &str) -> Result<U256, String> {
    U256::from_str_radix(s, 10).map_err(|_| format!("String {s} is not a valid U256"))
}

/// Helper function to calculate the call gas limit of a [UserOperation](UserOperation)
/// The function is invoked by the
/// [estimate_user_operation_gas](crates::uopool::estimate::estimate_user_operation_gas) method.
///
/// # Arguments
/// `paid` - The paid gas
/// `pre_op_gas` - The pre-operation gas
/// `fee_per_gas` - The fee per gas
///
/// # Returns
/// The call gas limit of the [UserOperation](UserOperation)
pub fn calculate_call_gas_limit(paid: U256, pre_op_gas: U256, fee_per_gas: U256) -> U256 {
    paid / fee_per_gas - pre_op_gas + Overhead::default().fixed
}
