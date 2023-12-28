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
