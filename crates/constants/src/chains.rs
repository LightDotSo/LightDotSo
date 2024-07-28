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

use lazy_static::lazy_static;
use std::collections::HashMap;

// The mainnet chain ids
lazy_static! {
    pub static ref MAINNET_CHAIN_IDS: HashMap<u64, &'static str> = {
        let mut m = HashMap::new();

        m.insert(1, "Ethereum Mainnet");
        m.insert(10, "Optimism Mainnet");
        m.insert(56, "Binance Smart Chain Mainnet");
        m.insert(100, "Gnosis Mainnet");
        m.insert(137, "Polygon Mainnet");
        m.insert(250, "Fantom Mainnet");
        m.insert(1101, "Polygon zkEVM Mainnet");
        m.insert(1329, "Sei Mainnet");
        m.insert(5000, "Mantle Mainnet");
        m.insert(8453, "Base Mainnet");
        m.insert(34443, "Mode Mainnet");
        m.insert(42161, "Arbitrum One Mainnet");
        m.insert(42170, "Arbitrum Nova Mainnet");
        m.insert(42220, "Celo Mainnet");
        m.insert(43114, "Avalanche Mainnet");
        m.insert(59144, "Linea Mainnet");
        m.insert(81457, "Blast Mainnet");
        m.insert(534352, "Scroll Mainnet");
        m.insert(7777777, "Zora Mainnet");

        m
    };
}

// The testnet chain ids
lazy_static! {
    pub static ref TESTNET_CHAIN_IDS: HashMap<u64, &'static str> = {
        let mut m = HashMap::new();

        m.insert(59141, "Linea Sepolia Testnet");
        m.insert(80002, "Polygon Amoy Testnet");
        m.insert(84532, "Base Sepolia Testnet");
        m.insert(421614, "Arbitrum Sepolia Testnet");
        m.insert(713715, "Sei Devnet");
        m.insert(11155111, "Sepolia Testnet");
        m.insert(11155420, "Optimism Sepolia Testnet");
        m.insert(168587773, "Blast Sepolia Testnet");

        m
    };
}

// The deprecated chain ids
lazy_static! {
    pub static ref DEPRECATED_CHAIN_IDS: HashMap<u64, &'static str> = {
        let mut m = HashMap::new();

        m.insert(80001, "Polygon Mumbai");

        m
    };
}

// All chain ids
lazy_static! {
    pub static ref ALL_CHAIN_IDS: HashMap<u64, &'static str> = {
        let mut m = MAINNET_CHAIN_IDS.clone();
        for (k, v) in TESTNET_CHAIN_IDS.iter() {
            m.insert(*k, *v);
        }
        m
    };
}

// Define the mapping of chain IDs to native token symbols
lazy_static! {
    pub static ref NATIVE_TOKEN_SYMBOLS: HashMap<u64, &'static str> = {
        let mut m = HashMap::new();
        m.insert(56, "BNB");
        m.insert(100, "XDAI");
        m.insert(137, "MATIC");
        m.insert(250, "FTM");
        m.insert(1329, "SEI");
        m.insert(5000, "MANTLE");
        m.insert(42220, "CELO");
        m.insert(43114, "AVAX");
        m
    };
}

// The sleep chain ids
lazy_static! {
    pub static ref SLEEP_CHAIN_IDS: HashMap<u64, i32> = {
        let mut m = HashMap::new();
        m.insert(31337, 1);
        m
    };
}

// The anvil chain id
lazy_static! {
    pub static ref ANVIL_CHAIN_ID: u64 = 31337;
}

// The runner chain ids
lazy_static! {
  pub static ref RUNNER_CHAIN_IDS: [u64; 4] = [
    // Mainnet
    1,
    // Gnosis
    100,
    // Local
    31337,
    // Sepolia
    11155111
  ];
}

// Routescan chain ids
lazy_static! {
    pub static ref ROUTESCAN_CHAIN_IDS: HashMap<u64, &'static str> = {
        let mut m = HashMap::new();

        m.insert(168587773, "Blast Sepolia Testnet");

        m
    };
}
