// Copyright 2023-2024 Light
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
