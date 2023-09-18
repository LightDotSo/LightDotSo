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

use ethers::{
    contract::abigen,
    providers::{Http, Provider},
    types::Address,
};
use eyre::Result;

abigen!(LightVerifyingPaymaster, "abi/LightVerifyingPaymaster.json",);

pub async fn get_paymaster(
    chain_id: u64,
    verifying_paymaster_address: Address,
) -> Result<LightVerifyingPaymaster<Provider<Http>>> {
    // Get the provider.
    let provider = Provider::<Http>::try_from(format!(
        "http://lightdotso-rpc-internal:3000/internal/{}",
        chain_id
    ))?;

    // Get the contract.
    let contract = LightVerifyingPaymaster::new(verifying_paymaster_address, provider.into());

    // Return the contract.
    Ok(contract)
}
