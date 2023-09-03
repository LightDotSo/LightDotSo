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
use std::collections::HashMap;

// The factory addresses
lazy_static! {
    pub static ref FACTORY_ADDRESSES: [Address; 4] = [
      // Local
      "0x262aD6Becda7CE4B047a3130491978A8f35F9aeC".parse().unwrap(),
      // v0.0.0
      "0x63CBfA247a2c1043892c7cEB4C21d1d8BC71Ffab".parse().unwrap(),
      // v0.0.1
      "0x426Ff63A09eFa1E7ccb3517E046956346e311881".parse().unwrap(),
      // v0.1.0
      "0x0000000000756D3E6464f5efe7e413a0Af1C7474".parse().unwrap(),
    ];
}

// The sleep chain ids
lazy_static! {
    pub static ref SLEEP_CHAIN_IDS: HashMap<u64, i32> = {
        let mut m = HashMap::new();
        m.insert(31337, 1);
        m.insert(11155111, 3);
        m
    };
}

// The anvil chain id
lazy_static! {
    pub static ref ANVIL_CHAIN_ID: u64 = 31337;
}

// The testnet chain ids
lazy_static! {
  pub static ref TESTNET_CHAIN_IDS: [u64; 2] = [
    // Local
    31337,
    // Sepolia
    11155111
  ];
}

// The runner chain ids
lazy_static! {
  pub static ref RUNNER_CHAIN_IDS: [u64; 1] = [
    // Local
    31337,
  ];
}
