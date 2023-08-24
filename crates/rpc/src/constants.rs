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

use lazy_static::lazy_static;
use std::collections::HashMap;

// The internal bundler rpc urls
lazy_static! {
    pub static ref BUNDLER_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Testnet
        m.insert(11155111, "http://lightdotso-bundler-sepolia.internal:3000".to_string());

        m
    };
}

// The infura rpc urls
lazy_static! {
    pub static ref INFURA_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://mainnet.infura.io/v3/".to_string());
        m.insert(10, "https://optimism-mainnet.infura.io/v3/".to_string());
        m.insert(137, "https://polygon-mainnet.infura.io/v3/".to_string());
        m.insert(42161, "https://arbitrum-mainnet.infura.io/v3/".to_string());
        m.insert(43114, "https://avalanche-mainnet.infura.io/v3/".to_string());
        m.insert(59144, "https://linea-mainnet.infura.io/v3/".to_string());

        // Testnet
        m.insert(11155111, "https://sepolia.infura.io/v3/".to_string());
        m
    };
}

// The node rpc urls
lazy_static! {
    pub static ref NODE_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://www.noderpc.xyz/rpc-mainnet/".to_string());
        m.insert(137, "https://www.noderpc.xyz/rpc-polygon/".to_string());

        // Testnet
        m.insert(11155111, "https://www.noderpc.xyz/rpc-sepolia/".to_string());
        m
    };
}

// The chainnodes rpc urls
lazy_static! {
    pub static ref CHAINNODES_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://mainnet.chainnodes.org/".to_string());
        m.insert(10, "https://optimism-mainnet.chainnodes.org/".to_string());
        m.insert(137, "https://polygon-mainnet.chainnodes.org/".to_string());
        m.insert(42161, "https://arbitrum-one.chainnodes.org/".to_string());

        m
    };
}
