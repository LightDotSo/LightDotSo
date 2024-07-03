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

// The alchemy rpc policy ids
lazy_static! {
    pub static ref ALCHEMY_POLICY_IDS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "a0036482-3134-4c7d-87d2-79c41293a347".to_string());
        m.insert(10, "ee2d5ea7-2f71-4fc2-bf3e-56ccbb3be844".to_string());
        m.insert(137, "e404a9c5-be89-46e8-b5bc-f0264b655841".to_string());
        m.insert(252, "50ebd75d-8584-4fdf-b4d8-b10c1d00b6a7".to_string());
        m.insert(8453, "1a57369f-23d0-4e10-9115-cae1bfb16886".to_string());
        m.insert(42161, "87746b0e-7bce-4a4a-8f90-4635355bbd06".to_string());
        m.insert(7777777, "66bf3331-f5c0-4d12-bb8c-77b4f071e835".to_string());

        // Testnet
        m.insert(2522, "f77a0088-cab9-447a-9ffc-c9a8bb6e9ab8".to_string());
        m.insert(80002, "7236e9bd-0171-429e-a062-928ade9cc376".to_string());
        m.insert(84532, "e3ccac03-aaf8-43d1-836c-8a25e9ad6bc7".to_string());
        m.insert(421614, "2328eb5a-63ad-4cc7-ad1d-3b51cd86a4fc".to_string());
        m.insert(11155111, "f090827f-44c1-4134-af21-458f88e7a854".to_string());
        m.insert(11155420, "aef503bc-8eab-441b-a3f5-5ba73869e62a".to_string());
        m.insert(999999999, "15c2d580-f017-4961-aedf-fa2e637beb3a".to_string());

        m
    };
}
