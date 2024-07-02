// Copyright 2023-2024 Light, Inc.
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

#![allow(clippy::unwrap_used)]

use ethers::types::Address;
use lazy_static::lazy_static;
use std::collections::HashMap;

// The paymaster addresses
lazy_static! {
    #[derive(Debug)]
    pub static ref PAYMASTER_ADDRESSES_MAP: HashMap<Address, Address> = {
        let addresses = [
            // Offchain_address, Onchain_address
            // v1: Fallback Verifier
            ("0x514a099c7eC404adF25e3b6b6A3523Ac3A4A778F", "0x000000000018d32DF916ff115A25fbeFC70bAf8b"),
            // v2: Production verifier
            ("0xEEdeadba8cAC470fDCe318892a07aBE26Aa4ab17", "0x000000000003193FAcb32D1C120719892B7AE977"),
            // v3: Production verifier
            ("0x0618fe3a19a4980a0202adbdb5201e74cd9908ff", "0x000000000054230BA02ADD2d96fA4362A8606F97"),
        ];

        addresses
            .iter()
            .map(|(offchain, onchain)| (offchain.parse().unwrap(), onchain.parse().unwrap()))
            .collect()
    };
}

// The pimlico sponsorship policy settings
lazy_static! {
    #[derive(Debug)]
    pub static ref PIMLICO_SPONSORSHIP_POLICIES: Vec<String> = {
        vec![
            "sp_natural_sandman".to_string(),
        ]
    };
}

// The pimlico base url
lazy_static! {
    #[derive(Debug)]
    pub static ref PIMLICO_BASE_URL: String = {
        "https://api.pimlico.io/v2".to_string()
    };
}

// The particle network paymaster base url
lazy_static! {
    #[derive(Debug)]
    pub static ref PARTICLE_NETWORK_PAYMASTER_BASE_URL: String = {
        "https://paymaster.particle.network".to_string()
    };
}
