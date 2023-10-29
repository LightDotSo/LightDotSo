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

use ethers::types::Address;
use lazy_static::lazy_static;

// The paymaster addresses
lazy_static! {
    #[derive(Debug)]
    pub static ref LIGHT_PAYMASTER_ADDRESS: Address =
      // v1 (Fallback)
      "0x000000000018d32DF916ff115A25fbeFC70bAf8b".parse().unwrap();
}

// The factory addresses
lazy_static! {
    #[derive(Debug)]
    pub static ref LIGHT_WALLET_FACTORY_ADDRESS: Address =
      // v0.1.0
      "0x0000000000756D3E6464f5efe7e413a0Af1C7474".parse().unwrap();
}

// The factory implementation addresses
lazy_static! {
    #[derive(Debug)]
    pub static ref LIGHT_WALLET_FACTORY_IMPLEMENTATION_ADDRESS: Address =
      // v0.1.0
      "0x8fb3cfdf2082c2be7d3205d361067748ea1abf63".parse().unwrap();
}

// The example wallet addresses
lazy_static! {
    #[derive(Debug)]
    pub static ref LIGHT_WALLET_EXAMPLE_ADDRESS: Address =
      // v0.1.0
      "0x10DbbE70128929723c1b982e53c51653232e4Ff2".parse().unwrap();
}

// The entrypoint addresses
lazy_static! {
    #[derive(Debug)]
    pub static ref ENTRYPOINT_V060_ADDRESS: Address =
      // v0.6.0
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789".parse().unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_light_paymaster_address() {
        assert_eq!(
            format!("{:?}", *LIGHT_PAYMASTER_ADDRESS),
            "0x000000000018d32df916ff115a25fbefc70baf8b".to_string(),
            "The expected and actual paymaster addresses should match"
        );
    }
}
