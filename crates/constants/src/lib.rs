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

use lazy_static::lazy_static;
use std::collections::HashMap;

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
