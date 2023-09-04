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
  pub static ref RUNNER_CHAIN_IDS: [u64; 5] = [
    // Mainnet
    1,
    // Optimism
    10,
    // Gnosis
    100,
    // Local
    31337,
    // Sepolia
    11155111
  ];
}

// The chain ids to start block
lazy_static! {
    pub static ref DEPLOY_CHAIN_IDS: HashMap<u64, i64> = {
        let mut m = HashMap::new();
        // Mainnet
        // https://etherscan.io/tx/0xc6b87c3fca696baf2b43de41fc632abdf9c6885d70561aae2840fe67c3964b80
        m.insert(1, 18039585);
        // Optimism
        // https://optimistic.etherscan.io/tx/0x611b4a05622784295d8db416c46c96f7561677f3138c96671322324eecf3d397
        m.insert(10, 108976643);
        // BSC
        // https://bscscan.com/tx/0xd43347b2df1a6047a1144302f74ac8faec27bfdb36e93af88dc467db806afb6c
        m.insert(56, 31414354);
        // Gnosis
        // https://gnosisscan.io/tx/0x0b52d24d06eab395fe156d10e6b52febd1a415029e3fd4011baef0f5bb9ebd05
        m.insert(100, 29785769);
        // Polygon
        // https://polygonscan.com/tx/0xc4c152f70d7e35ab065a41e302f01a073303600aa53a52fc7ff625f0cd470728
        m.insert(137, 47007194);
        // Base
        // https://basescan.org/tx/0xd0eb3cc2b32447b97675beb992bafbabf889632684828a2216824d2deba1dcc7
        m.insert(8453, 3470401);
        // Arbitrum
        // https://arbiscan.io/tx/0x75be6607154baafdbfea04887dd75061882b0a0fc029e6cacf04594bf1c9814d
        m.insert(42161, 127586355);
        // Avalanche
        // https://snowtrace.io/tx/0x08ea42012d24b605986c8e671c78358625a7ef764be4a1dab853643a3e805802
        m.insert(43114, 34714138);

        // Sepolia
        // https://sepolia.etherscan.io/tx/0xa009d527c08a86d1d3c2bc943be5a6a2258da3dbe06a25be35939110726e58df
        m.insert(11155111, 4202058);

        m
    };
}
