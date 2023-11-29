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

/// Construct the paymaster and data.
pub fn decode_paymaster_and_data(msg: Vec<u8>) -> (Address, u64, u64, Vec<u8>) {
    // Get the verifying paymaster address.
    let verifying_paymaster_address = Address::from_slice(&msg[0..20]);

    // Get the valid until.
    let valid_until = u64::from_be_bytes(msg[44..52].try_into().unwrap());
    // Get the valid after.
    let valid_after = u64::from_be_bytes(msg[76..84].try_into().unwrap());
    // Get the signature.
    let signature = msg[84..].to_vec();

    (verifying_paymaster_address, valid_until, valid_after, signature)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::LIGHT_PAYMASTER_ADDRESSES;
    use ethers::utils::hex;

    #[ignore]
    #[tokio::test]
    async fn test_get_paymaster() {
        let chain_id = 1;
        // Get the address
        let verifying_paymaster_address = LIGHT_PAYMASTER_ADDRESSES[0];

        let res = get_paymaster(chain_id, verifying_paymaster_address).await;
        assert!(res.is_ok());

        // If you want to test the details of the resulting contract:
        let contract = res.unwrap();
        assert_eq!(contract.address(), verifying_paymaster_address);
    }

    #[test]
    fn test_decode_paymaster_and_data() {
        // Get the expected msg.
        let expected_msg: Vec<u8> = hex::decode("0dcd1bf9a1b36ce34237eeafef220931846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Decode the paymaster and data.
        let (verifying_paymaster_address, valid_until, valid_after, signature) =
            decode_paymaster_and_data(expected_msg);

        // Expected result.
        let expected_verifying_paymaster_address =
            "0x0DCd1Bf9A1b36cE34237eEaFef220931846BCD82".parse().unwrap();
        let expected_valid_until = u64::from_str_radix("00000000deadbeef", 16).unwrap();
        let expected_valid_after = u64::from_str_radix("0000000000001234", 16).unwrap();
        let expected_signature: Vec<u8> = hex::decode("dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Assert that the result matches the expected value
        assert_eq!(verifying_paymaster_address, expected_verifying_paymaster_address);
        assert_eq!(valid_until, expected_valid_until);
        assert_eq!(valid_after, expected_valid_after);
        assert_eq!(signature, expected_signature);
    }
}
