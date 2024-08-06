// Copyright 2023-2024 LightDotSo.
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
        m.insert(1, "dd589d48-9d24-4147-bd84-e58ae1e0c230".to_string());
        m.insert(10, "c43f82d6-71a2-46b9-9974-4d4aeacfb6be".to_string());
        m.insert(137, "aa975c1f-f330-42c6-ac69-fbd9a8e2acc0".to_string());
        m.insert(252, "c4ce6a98-17aa-484a-a6ca-df91a27fe47e".to_string());
        m.insert(8453, "1e571063-c278-47c0-9746-c338276d40e1".to_string());
        m.insert(42161, "bda8abe2-a5ce-43f1-9382-16f3f56e9f30".to_string());
        m.insert(7777777, "de5723e2-65d4-428c-b154-1d3e72d7ccf4".to_string());

        // Testnet
        m.insert(2522, "764f5629-df9d-40a7-a465-1056f297a595".to_string());
        m.insert(80002, "8cc31361-3500-4220-975c-5844acc8ce9d".to_string());
        m.insert(84532, "44bcbdce-2122-478e-ad7e-dcf82d721167".to_string());
        m.insert(421614, "3e07561b-8b43-4cd1-8498-16c9cf04bbe8".to_string());
        m.insert(11155111, "0264de95-c0bc-422b-86a7-70f0c372546c".to_string());
        m.insert(11155420, "94e3559b-4b3f-427f-9d50-70c5fc02f51a".to_string());
        m.insert(999999999, "f29dfce1-d309-443e-ba1b-405273752fc2".to_string());

        m
    };
}

// The biconomy paymaster rpc urls
// From: https://docs.biconomy.io/Bundler/supportedNetworks
// Thank you to the Biconomy team for providing the service!
lazy_static! {
    pub static ref BICONOMY_PAYMASTER_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1329, "https://paymaster.biconomy.io/api/v1/1329/".to_string());

        m
    };
}

// The biconomy rpc policy ids
// From: https://docs.biconomy.io/supportedNetworks
lazy_static! {
    pub static ref BICONOMY_POLICY_IDS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1329, "7GR4dz_kx.9ca8789e-cbae-4a71-91d6-6fca2a96d055".to_string());

        m
    };
}
