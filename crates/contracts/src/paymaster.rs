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

use crate::provider::get_provider;

abigen!(LightVerifyingPaymaster, "abi/LightVerifyingPaymaster.json",);

pub async fn get_paymaster(
    chain_id: u64,
    verifying_paymaster_address: Address,
) -> Result<LightVerifyingPaymaster<Provider<Http>>> {
    // Get the provider.
    let provider = get_provider(chain_id).await?;

    // Get the contract.
    let contract = LightVerifyingPaymaster::new(verifying_paymaster_address, provider.into());

    // Return the contract.
    Ok(contract)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::LIGHT_PAYMASTER_ADDRESS;

    // TODO: Setup wireguard on the CI in order to run
    #[ignore]
    #[tokio::test]
    async fn test_get_paymaster() {
        let chain_id = 1;
        // Get the address
        let verifying_paymaster_address = *LIGHT_PAYMASTER_ADDRESS;

        let result = get_paymaster(chain_id, verifying_paymaster_address).await;
        assert!(result.is_ok());

        // If you want to test the details of the resulting contract:
        // let contract = result.unwrap();
        // assert_eq!(contract.address(), verifying_paymaster_address);
        // assert!(contract.is_read_only());  // or some other method on LightVerifyingPaymaster
    }
}
