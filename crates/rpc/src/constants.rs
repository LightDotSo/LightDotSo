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

// The internal gas rpc url
lazy_static! {
    pub static ref GAS_RPC_URL: String = "http://lightdotso-gas.internal:3000".to_string();
}

// The internal paymaster rpc url
lazy_static! {
    pub static ref PAYMASTER_RPC_URL: String =
        "http://lightdotso-paymaster.internal:3000".to_string();
}

// The internal simulator rpc url
lazy_static! {
    pub static ref SIMULATOR_RPC_URL: String =
        "http://lightdotso-simulator.internal:3000".to_string();
}

// The internal bundler rpc urls
lazy_static! {
    pub static ref BUNDLER_RPC_URL: String = "http://lightdotso-bundler.internal:3000".to_string();
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

// The alchemy rpc urls
lazy_static! {
    pub static ref ALCHEMY_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://eth-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(10, "https://opt-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(137, "https://polygon-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(1101, "https://polygonzkevm-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(8453, "https://base-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(42161, "https://arb-mainnet.g.alchemy.com/v2/".to_string());

        // Testnet
        m.insert(80001, "https://polygon-mumbai.g.alchemy.com/v2/".to_string());
        m.insert(11155111, "https://eth-sepolia.g.alchemy.com/v2/".to_string());

        m
    };
}

// The nodereal rpc urls
lazy_static! {
    pub static ref NODEREAL_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://eth-mainnet.nodereal.io/v1/".to_string());
        m.insert(10, "https://opt-mainnet.nodereal.io/v1/".to_string());
        m.insert(56, "https://bsc-mainnet.nodereal.io/v1/".to_string());
        m.insert(137, "https://polygon-mainnet.nodereal.io/v1/".to_string());

        m
    };
}

// The blast api rpc urls
lazy_static! {
    pub static ref BLASTAPI_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://eth-mainnet.blastapi.io/".to_string());
        m.insert(10, "https://optimism-mainnet.blastapi.io/".to_string());
        m.insert(56, "https://bsc-mainnet.blastapi.io/".to_string());
        m.insert(100, "https://gnosis-mainnet.blastapi.io/".to_string());
        m.insert(137, "https://polygon-mainnet.blastapi.io/".to_string());
        m.insert(8453, "https://base-mainnet.blastapi.io/".to_string());
        m.insert(42161, "https://arbitrum-mainnet.blastapi.io/".to_string());
        m.insert(43114, "https://ava-mainnet.blastapi.io/".to_string());

        // Testnet
        m.insert(11155111, "https://eth-sepolia.blastapi.io/".to_string());

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

// The public rpc urls
lazy_static! {
    pub static ref PUBLIC_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://cloudflare-eth.com".to_string());
        m.insert(10, "https://mainnet.optimism.io".to_string());
        m.insert(56, "https://bsc-dataseed.binance.org".to_string());
        m.insert(100, "https://rpc.gnosischain.com".to_string());
        m.insert(8453, "https://mainnet.base.org".to_string());
        m.insert(42161, "https://arb1.arbitrum.io/rpc".to_string());
        m.insert(43114, "https://api.avax.network/ext/bc/C/rpc".to_string());

        // Testnet
        m.insert(11155111, "https://rpc.sepolia.org".to_string());

        m
    };
}

// The public rpc urls
lazy_static! {
    pub static ref ANKR_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://rpc.ankr.com/eth".to_string());
        m.insert(10, "https://rpc.ankr.com/optimism".to_string());
        m.insert(56, "https://rpc.ankr.com/bsc".to_string());
        m.insert(100, "https://rpc.ankr.com/gnosis".to_string());
        m.insert(137, "https://rpc.ankr.com/polygon".to_string());
        m.insert(250, "https://rpc.ankr.com/fantom".to_string());
        m.insert(1101, "https://rpc.ankr.com/polygon_zkevm".to_string());
        m.insert(8453, "https://rpc.ankr.com/base".to_string());
        m.insert(42161, "https://rpc.ankr.com/arbitrum".to_string());
        m.insert(42170, "https://rpc.ankr.com/arbitrumnova".to_string());
        m.insert(42220, "https://rpc.ankr.com/celo".to_string());
        m.insert(43114, "https://rpc.ankr.com/avalanche".to_string());
        m.insert(1666600000, "https://rpc.ankr.com/harmony".to_string());

        // Testnet
        m.insert(11155111, "https://rpc.ankr.com/eth_sepolia".to_string());

        m
    };
}

// The thirdweb rpc urls
lazy_static! {
    pub static ref THIRDWEB_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://ethereum.rpc.thirdweb.com".to_string());
        m.insert(10, "https://optimism.rpc.thirdweb.com".to_string());
        m.insert(56, "https://binance.rpc.thirdweb.com".to_string());
        m.insert(100, "https://gnosis.rpc.thirdweb.com".to_string());
        m.insert(137, "https://polygon.rpc.thirdweb.com".to_string());
        m.insert(250, "https://fantom.rpc.thirdweb.com".to_string());
        m.insert(1101, "https://polygon-zkevm.rpc.thirdweb.com".to_string());
        m.insert(8453, "https://base.rpc.thirdweb.com".to_string());
        m.insert(42161, "https://arbitrum.rpc.thirdweb.com".to_string());
        m.insert(42170, "https://arbitrum-nova.rpc.thirdweb.com".to_string());
        m.insert(42220, "https://celo.rpc.thirdweb.com".to_string());
        m.insert(43114, "https://avalanche.rpc.thirdweb.com".to_string());
        m.insert(1666600000, "https://harmony-shard-0.rpc.thirdweb.com".to_string());

        // Testnet
        m.insert(11155111, "https://sepolia.rpc.thirdweb.com".to_string());

        m
    };
}

// The nodereal rpc urls
lazy_static! {
    pub static ref NODRPC_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://www.noderpc.xyz/rpc-mainnet/".to_string());
        m.insert(137, "https://www.noderpc.xyz/rpc-polygon/".to_string());

        // Testnet
        m.insert(5, "https://www.noderpc.xyz/rpc-goerli/".to_string());
        m.insert(1442, "https://www.noderpc.xyz/rpc-zkevm-test/".to_string());
        m.insert(80001, "https://www.noderpc.xyz/rpc-mumbai/".to_string());
        m.insert(11155111, "https://www.noderpc.xyz/rpc-sepolia/".to_string());

        m
    };
}

// The nodereal rpc urls
lazy_static! {
    pub static ref LLAMANODES_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://eth.llamarpc.com".to_string());
        m.insert(10, "https://optimism.llamarpc.com".to_string());
        m.insert(56, "https://binance.llamarpc.com".to_string());
        m.insert(137, "https://polygon.llamarpc.com".to_string());
        m.insert(42161, "https://arbitrum.llamarpc.com".to_string());

        m
    };
}

// The pimlico rpc urls
lazy_static! {
    pub static ref PIMLICO_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://api.pimlico.io/v1/ethereum/rpc".to_string());
        m.insert(10, "https://api.pimlico.io/v1/optimism/rpc".to_string());
        m.insert(56, "https://api.pimlico.io/v1/binance/rpc".to_string());
        m.insert(100, "https://api.pimlico.io/v1/gnosis/rpc".to_string());
        m.insert(137, "https://api.pimlico.io/v1/polygon/rpc".to_string());
        m.insert(8453, "https://api.pimlico.io/v1/base/rpc".to_string());
        m.insert(42161, "https://api.pimlico.io/v1/arbitrum/rpc".to_string());
        m.insert(43114, "https://api.pimlico.io/v1/avalanche/rpc".to_string());
        m.insert(59144, "https://api.pimlico.io/v1/linea/rpc".to_string());


        // Testnet
        m.insert(10200, "https://api.pimlico.io/v1/chiado-testnet/rpc".to_string());
        m.insert(80001, "https://api.pimlico.io/v1/mumbai/rpc".to_string());
        m.insert(11155111, "https://api.pimlico.io/v1/sepolia/rpc".to_string());

        m
    };
}
