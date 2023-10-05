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

abigen!(ERC1271, "abi/ERC1271.json",);

pub async fn get_erc_1271_wallet(
    chain_id: u64,
    wallet_address: Address,
) -> Result<ERC1271<Provider<Http>>> {
    // Get the provider.
    let provider = get_provider(chain_id).await?;

    // Get the contract.
    let contract = ERC1271::new(wallet_address, provider.into());

    // Return the contract.
    Ok(contract)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::LIGHT_WALLET_EXAMPLE_ADDRESS;

    #[ignore]
    #[tokio::test]
    async fn test_get_wallet() {
        let chain_id = 11155111;
        // Get the address
        let wallet_address = *LIGHT_WALLET_EXAMPLE_ADDRESS;

        let res = get_erc_1271_wallet(chain_id, wallet_address).await;
        assert!(res.is_ok());

        // If you want to test the details of the resulting contract:
        let contract = res.unwrap();
        assert_eq!(contract.address(), wallet_address);
    }
}
