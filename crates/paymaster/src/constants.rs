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

use std::collections::HashMap;

use ethers::types::Address;
use lazy_static::lazy_static;

// The paymaster addresses
lazy_static! {
    #[derive(Debug)]
    pub static ref PAYMASTER_ADDRESSES_MAP: HashMap<Address, Address> = {
        let addresses = [
            // Offchain_address, Onchain_address
            // Fallback Verifier for `0x000000000018d32DF916ff115A25fbeFC70bAf8b`
            ("0x514a099c7eC404adF25e3b6b6A3523Ac3A4A778F", "0x000000000018d32DF916ff115A25fbeFC70bAf8b"),
            // Production verifier
            ("0x514a099c7eC404adF25e3b6b6A3523Ac3A4A778F", "0x000000000018d32DF916ff115A25fbeFC70bAf8b"),
        ];

        addresses
            .iter()
            .map(|(offchain, onchain)| (offchain.parse().unwrap(), onchain.parse().unwrap()))
            .collect()
    };
}
