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

// The thirdweb rpc url
lazy_static! {
    pub static ref THIRDWEB_RPC_URL: String = "rpc.thirdweb.com".to_string();
}

// The infura rpc urls
// Thank you to the Infura team for providing the service!
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
// Thank you to the Alchemy team for providing the service!
lazy_static! {
    pub static ref ALCHEMY_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://eth-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(10, "https://opt-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(56, "https://bnb-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(137, "https://polygon-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(252, "https://frax-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(592, "https://astar-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(1088, "https://metis-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(1101, "https://polygonzkevm-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(7000, "https://zetachain-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(8453, "https://base-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(42161, "https://arb-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(81457, "https://blast-mainnet.g.alchemy.com/v2/".to_string());
        m.insert(7777777, "https://zora-mainnet.g.alchemy.com/v2/".to_string());

        // Testnet
        m.insert(97, "https://bnb-testnet.g.alchemy.com/v2/".to_string());
        m.insert(2442, "https://polygonzkevm-cardona.g.alchemy.com/v2/".to_string());
        m.insert(2522, "https://frax-sepolia.g.alchemy.com/v2/".to_string());
        m.insert(7001, "https://zetachain-testnet.g.alchemy.com/v2/".to_string());
        m.insert(80002, "https://polygon-amoy.g.alchemy.com/v2/".to_string());
        m.insert(84532, "https://base-sepolia.g.alchemy.com/v2/".to_string());
        m.insert(421614, "https://arb-sepolia.g.alchemy.com/v2/".to_string());
        m.insert(11155111, "https://eth-sepolia.g.alchemy.com/v2/".to_string());
        m.insert(11155420, "https://opt-sepolia.g.alchemy.com/v2/".to_string());
        m.insert(168587773, "https://blast-sepolia.g.alchemy.com/v2/".to_string());
        m.insert(999999999, "https://zora-sepolia.g.alchemy.com/v2/".to_string());

        m
    };
}

// The nodereal rpc urls
// Thank you to the NodeReal team for providing the service!
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
// Thank you to the Blast API team for providing the service!
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
        m.insert(11155420, "https://optimism-sepolia.blastapi.io/".to_string());

        m
    };
}

// The tenderly rpc urls
// Thank you to the tenderly team for providing the service!
// From: https://docs.tenderly.co/supported-networks
lazy_static! {
    pub static ref TENDERLY_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://mainnet.gateway.tenderly.co".to_string());
        m.insert(10, "https://optimism.gateway.tenderly.co".to_string());
        m.insert(137, "https://polygon.gateway.tenderly.co".to_string());
        m.insert(8453, "https://base.gateway.tenderly.co".to_string());
        m.insert(42161, "https://arbitrum.gateway.tenderly.co".to_string());
        m.insert(42170, "https://arbitrum-nova.gateway.tenderly.co".to_string());

        m
    };
}
// The chainnodes rpc urls
// Thank you to the Chainnodes team for providing the service!
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

// The public node rpc urls
// Thank you to the Public Node team for providing the service!
lazy_static! {
    pub static ref PUBLIC_NODE_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://ethereum-rpc.publicnode.com".to_string());
        m.insert(10, "https://optimism-rpc.publicnode.com".to_string());
        m.insert(56, "https://bsc-rpc.publicnode.com".to_string());
        m.insert(100, "https://gnosis-rpc.publicnode.com".to_string());
        m.insert(137, "https://polygon-bor-rpc.publicnode.com".to_string());
        m.insert(1329, "https://sei-rpc.publicnode.com".to_string());
        m.insert(8453, "https://base-rpc.publicnode.com".to_string());
        m.insert(42161, "https://arbitrum-one-rpc.publicnode.com".to_string());
        m.insert(43114, "https://avalanche-c-chain-rpc.publicnode.com".to_string());

        // Testnet
        m.insert(80001, "https://polygon-mumbai-bor.publicnode.com".to_string());
        m.insert(80002, "https://polygon-amoy-bor-rpc.publicnode.com".to_string());
        m.insert(84532, "https://base-sepolia.publicnode.com".to_string());
        m.insert(421614, "https://arbitrum-sepolia.publicnode.com".to_string());
        m.insert(11155111, "https://ethereum-sepolia.publicnode.com".to_string());
        m.insert(11155420, "https://optimism-sepolia.publicnode.com".to_string());

        m
    };
}

// The official public rpc urls
// Thank you to the respective chain teams for providing the service!
lazy_static! {
    pub static ref OFFICIAL_PUBLIC_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://cloudflare-eth.com".to_string());
        m.insert(10, "https://mainnet.optimism.io".to_string());
        m.insert(56, "https://bsc-dataseed.binance.org".to_string());
        m.insert(100, "https://rpc.gnosischain.com".to_string());
        m.insert(122, "https://rpc.fuse.io".to_string());
        m.insert(169, "https://pacific-rpc.manta.network/http".to_string());
        m.insert(690, "https://rpc.redstonechain.com".to_string());
        m.insert(1329, "https://evm-rpc.sei-apis.com".to_string());
        m.insert(5000, "https://rpc.mantle.xyz".to_string());
        m.insert(7560, "https://rpc.cyber.co".to_string());
        m.insert(8453, "https://mainnet.base.org".to_string());
        m.insert(34443, "https://mainnet.mode.network".to_string());
        m.insert(42161, "https://arb1.arbitrum.io/rpc".to_string());
        m.insert(42170, "https://nova.arbitrum.io/rpc".to_string());
        m.insert(43114, "https://api.avax.network/ext/bc/C/rpc".to_string());
        m.insert(59140, "https://rpc.linea.build ".to_string());
        m.insert(81457, "https://rpc.blast.io".to_string());
        m.insert(534352, "https://rpc.scroll.io".to_string());

        // Testnet
        m.insert(84532, "https://sepolia.base.org".to_string());
        m.insert(11155111, "https://rpc.sepolia.org".to_string());
        m.insert(11155420, "https://sepolia.optimism.io".to_string());
        m.insert(168587773, "https://sepolia.blast.io".to_string());

        m
    };
}

// The ankr rpc urls
// Thank you to the Ankr team for providing the service!
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
        m.insert(1329, "https://rpc.ankr.com/sei".to_string());
        m.insert(8453, "https://rpc.ankr.com/base".to_string());
        m.insert(42161, "https://rpc.ankr.com/arbitrum".to_string());
        m.insert(42170, "https://rpc.ankr.com/arbitrumnova".to_string());
        m.insert(42220, "https://rpc.ankr.com/celo".to_string());
        m.insert(43114, "https://rpc.ankr.com/avalanche".to_string());
        m.insert(59144, "https://rpc.ankr.com/linea".to_string());
        m.insert(1666600000, "https://rpc.ankr.com/harmony".to_string());

        // Testnet
        m.insert(80001, "https://rpc.ankr.com/polygon_mumbai".to_string());
        m.insert(84532, "https://rpc.ankr.com/base_sepolia".to_string());
        m.insert(421614, "https://rpc.ankr.com/arbitrum_sepolia".to_string());
        m.insert(11155111, "https://rpc.ankr.com/eth_sepolia".to_string());
        m.insert(11155420, "https://rpc.ankr.com/optimism_sepolia".to_string());

        m
    };
}

// The nodereal rpc urls
// Thank you to the Node RPC team for providing the service!
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

// The llama rpc urls
// Thank you to the Llama team for providing the service!
lazy_static! {
    pub static ref LLAMANODES_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://eth.llamarpc.com".to_string());
        m.insert(10, "https://optimism.llamarpc.com".to_string());
        m.insert(56, "https://binance.llamarpc.com".to_string());
        m.insert(137, "https://polygon.llamarpc.com".to_string());
        m.insert(8453, "https://base.llamarpc.com".to_string());
        m.insert(42161, "https://arbitrum.llamarpc.com".to_string());

        m
    };
}

// The biconomy rpc urls
// From: https://docs.biconomy.io/Bundler/supportedNetworks
// Thank you to the Biconomy team for providing the service!
lazy_static! {
    pub static ref BICONOMY_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://bundler.biconomy.io/api/v2/1/".to_string());
        m.insert(10, "https://bundler.biconomy.io/api/v2/10/".to_string());
        m.insert(56, "https://bundler.biconomy.io/api/v2/56/".to_string());
        m.insert(100, "https://bundler.biconomy.io/api/v2/100/".to_string());
        m.insert(137, "https://bundler.biconomy.io/api/v2/137/".to_string());
        m.insert(169, "https://bundler.biconomy.io/api/v2/169/".to_string());
        m.insert(204, "https://bundler.biconomy.io/api/v2/204/".to_string());
        m.insert(592, "https://bundler.biconomy.io/api/v2/592/".to_string());
        m.insert(1101, "https://bundler.biconomy.io/api/v2/1101/".to_string());
        m.insert(1116, "https://bundler.biconomy.io/api/v2/1116/".to_string());
        m.insert(1329, "https://bundler.biconomy.io/api/v2/1329/".to_string());
        m.insert(5000, "https://bundler.biconomy.io/api/v2/5000/".to_string());
        m.insert(8453, "https://bundler.biconomy.io/api/v2/8453/".to_string());
        m.insert(9980, "https://bundler.biconomy.io/api/v2/9980/".to_string());
        m.insert(42161, "https://bundler.biconomy.io/api/v2/42161/".to_string());
        m.insert(42170, "https://bundler.biconomy.io/api/v2/42170/".to_string());
        m.insert(43114, "https://bundler.biconomy.io/api/v2/43114/".to_string());
        m.insert(59144, "https://bundler.biconomy.io/api/v2/59144/".to_string());
        m.insert(81457, "https://bundler.biconomy.io/api/v2/81457/".to_string());

        // Testnet
        m.insert(10200, "https://bundler.biconomy.io/api/v2/10200/".to_string());
        m.insert(80001, "https://bundler.biconomy.io/api/v2/80001/".to_string());
        m.insert(84532, "https://bundler.biconomy.io/api/v2/84532/".to_string());
        // m.insert(421614, "https://bundler.biconomy.io/api/v2/421614".to_string());
        m.insert(11155111, "https://bundler.biconomy.io/api/v2/11155111/".to_string());
        // m.insert(11155420, "https://bundler.biconomy.io/api/v2/11155420".to_string());

        m
    };
}

// The pimlico rpc urls
// From: https://docs.pimlico.io/infra/platform/supported-chains
// Thank you to the Pimlico team for providing the service!
lazy_static! {
    pub static ref PIMLICO_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://api.pimlico.io/v2/ethereum/rpc".to_string());
        m.insert(10, "https://api.pimlico.io/v2/optimism/rpc".to_string());
        m.insert(30, "https://api.pimlico.io/v2/rootstock/rpc".to_string());
        m.insert(56, "https://api.pimlico.io/v2/binance/rpc".to_string());
        m.insert(100, "https://api.pimlico.io/v2/gnosis/rpc".to_string());
        m.insert(122, "https://api.pimlico.io/v2/fuse/rpc".to_string());
        m.insert(137, "https://api.pimlico.io/v2/polygon/rpc".to_string());
        m.insert(204, "https://api.pimlico.io/v2/opbnb/rpc".to_string());
        m.insert(252, "https://api.pimlico.io/v2/fraxtal/rpc".to_string());
        m.insert(690, "https://api.pimlico.io/v2/redstone/rpc".to_string());
        m.insert(957, "https://api.pimlico.io/v2/lyra/rpc".to_string());
        m.insert(1088, "https://api.pimlico.io/v2/metis/rpc".to_string());
        m.insert(5000, "https://api.pimlico.io/v2/mantle/rpc".to_string());
        m.insert(7560, "https://api.pimlico.io/v2/cyber-mainnet/rpc".to_string());
        m.insert(7887, "https://api.pimlico.io/v2/kinto/rpc".to_string());
        m.insert(7979, "https://api.pimlico.io/v2/dos-mainnet/rpc".to_string());
        m.insert(8217, "https://api.pimlico.io/v2/klaytn-cypress/rpc".to_string());
        m.insert(8333, "https://api.pimlico.io/v2/b3/rpc".to_string());
        m.insert(8453, "https://api.pimlico.io/v2/base/rpc".to_string());
        m.insert(22222, "https://api.pimlico.io/v2/nautilus/rpc".to_string());
        m.insert(34443, "https://api.pimlico.io/v2/mode/rpc".to_string());
        m.insert(41455, "https://api.pimlico.io/v2/alephzero/rpc".to_string());
        m.insert(42161, "https://api.pimlico.io/v2/arbitrum/rpc".to_string());
        m.insert(42170, "https://api.pimlico.io/v2/arbitrum-nova/rpc".to_string());
        m.insert(42220, "https://api.pimlico.io/v2/celo/rpc".to_string());
        m.insert(43114, "https://api.pimlico.io/v2/avalanche/rpc".to_string());
        m.insert(53935, "https://api.pimlico.io/v2/dfk-chain/rpc".to_string());
        m.insert(59144, "https://api.pimlico.io/v2/linea/rpc".to_string());
        m.insert(60808, "https://api.pimlico.io/v2/bob/rpc".to_string());
        m.insert(81457, "https://api.pimlico.io/v2/blast/rpc".to_string());
        m.insert(534352, "https://api.pimlico.io/v2/scroll/rpc".to_string());
        m.insert(660279, "https://api.pimlico.io/v2/xai/rpc".to_string());
        m.insert(978657, "https://api.pimlico.io/v2/treasure-ruby/rpc".to_string());
        m.insert(7777777, "https://api.pimlico.io/v2/zora/rpc".to_string());
        m.insert(888888888, "https://api.pimlico.io/v2/ancient8/rpc".to_string());

        // Testnet
        m.insert(31, "https://api.pimlico.io/v2/rootstock-testnet/rpc".to_string());
        m.insert(97, "https://api.pimlico.io/v2/binance-testnet/rpc".to_string());
        m.insert(111, "https://api.pimlico.io/v2/bob-sepolia/rpc".to_string());
        m.insert(123, "https://api.pimlico.io/v2/fuse-sparknet/rpc".to_string());
        m.insert(335, "https://api.pimlico.io/v2/dfk-chain-test/rpc".to_string());
        m.insert(919, "https://api.pimlico.io/v2/mode-sepolia/rpc".to_string());
        m.insert(1001, "https://api.pimlico.io/v2/klaytn-baobab/rpc".to_string());
        m.insert(1513, "https://api.pimlico.io/v2/story-testnet/rpc".to_string());
        m.insert(1993, "https://api.pimlico.io/v2/b3-sepolia/rpc".to_string());
        m.insert(2039, "https://api.pimlico.io/v2/alephzero-testnet/rpc".to_string());
        m.insert(3939, "https://api.pimlico.io/v2/dos-testnet/rpc".to_string());
        m.insert(4202, "https://api.pimlico.io/v2/lisk-sepolia/rpc".to_string());
        m.insert(10200, "https://api.pimlico.io/v2/chiado-testnet/rpc".to_string());
        m.insert(17069, "https://api.pimlico.io/v2/garnet-holesky/rpc".to_string());
        m.insert(43113, "https://api.pimlico.io/v2/avalanche-fuji/rpc".to_string());
        m.insert(44787, "https://api.pimlico.io/v2/celo-alfajores-testnet/rpc".to_string());
        m.insert(59141, "https://api.pimlico.io/v2/linea-sepolia/rpc".to_string());
        m.insert(59902, "https://api.pimlico.io/v2/metis-sepolia/rpc".to_string());
        m.insert(78600, "https://api.pimlico.io/v2/vanguard-testnet/rpc".to_string());
        m.insert(80002, "https://api.pimlico.io/v2/polygon-amoy/rpc".to_string());
        m.insert(84532, "https://api.pimlico.io/v2/base-sepolia/rpc".to_string());
        m.insert(90354, "https://api.pimlico.io/v2/camp-sepolia/rpc".to_string());
        m.insert(98985, "https://api.pimlico.io/v2/superposition-testnet/rpc".to_string());
        m.insert(132902, "https://api.pimlico.io/v2/form-testnet/rpc".to_string());
        m.insert(167008, "https://api.pimlico.io/v2/taiko-katla-l2/rpc".to_string());
        m.insert(421614, "https://api.pimlico.io/v2/arbitrum-sepolia/rpc".to_string());
        m.insert(534351, "https://api.pimlico.io/v2/scroll-sepolia-testnet/rpc".to_string());
        m.insert(3397901, "https://api.pimlico.io/v2/funki-testnet/rpc".to_string());
        m.insert(11155111, "https://api.pimlico.io/v2/sepolia/rpc".to_string());
        m.insert(11155420, "https://api.pimlico.io/v2/optimism-sepolia/rpc".to_string());
        m.insert(28122024, "https://api.pimlico.io/v2/ancient8-testnet/rpc".to_string());
        m.insert(111557560, "https://api.pimlico.io/v2/cyber-testnet/rpc".to_string());
        m.insert(161221135, "https://api.pimlico.io/v2/plume-testnet/rpc".to_string());
        m.insert(168587773, "https://api.pimlico.io/v2/blast-sepolia/rpc".to_string());
        m.insert(999999999, "https://api.pimlico.io/v2/zora-sepolia/rpc".to_string());
        m.insert(37714555429, "https://api.pimlico.io/v2/xai-sepolia-orbit/rpc".to_string());

        m
    };
}

// The etherspot rpc urls
// From: https://etherspot.fyi/prime-sdk/chains-supported
// Thank you to the Etherspot team for providing these public endpoints!
lazy_static! {
    pub static ref ETHERSPOT_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://ethereum-bundler.etherspot.io/".to_string());
        m.insert(10, "https://optimism-bundler.etherspot.io/".to_string());
        m.insert(14, "https://flare-bundler.etherspot.io/".to_string());
        m.insert(30, "https://rootstock-bundler.etherspot.io/".to_string());
        m.insert(56, "https://bnb-bundler.etherspot.io/".to_string());
        m.insert(100, "https://gnosis-bundler.etherspot.io/".to_string());
        m.insert(122, "https://fuse-bundler.etherspot.io/".to_string());
        m.insert(137, "https://polygon-bundler.etherspot.io/".to_string());
        m.insert(5000, "https://mantle-bundler.etherspot.io/".to_string());
        m.insert(8453, "https://base-bundler.etherspot.io/".to_string());
        m.insert(42161, "https://arbitrum-bundler.etherspot.io/".to_string());
        m.insert(43114, "https://avalanche-bundler.etherspot.io/".to_string());
        m.insert(59144, "https://linea-bundler.etherspot.io/".to_string());
        m.insert(534352, "https://scroll-bundler.etherspot.io/".to_string());
        m.insert(888888888, "https://ancient8-bundler.etherspot.io/".to_string());

        // Testnet
        m.insert(31, "https://testnet-rpc.etherspot.io/v1/31".to_string());
        m.insert(114, "https://testnet-rpc.etherspot.io/v1/114".to_string());
        m.insert(123, "https://testnet-rpc.etherspot.io/v1/123".to_string());
        m.insert(5003, "https://testnet-rpc.etherspot.io/v1/5003".to_string());
        m.insert(80002, "https://testnet-rpc.etherspot.io/v1/80002".to_string());
        m.insert(84532, "https://testnet-rpc.etherspot.io/v1/84532".to_string());
        m.insert(421614, "https://testnet-rpc.etherspot.io/v1/421614".to_string());
        m.insert(534351, "https://testnet-rpc.etherspot.io/v1/534351".to_string());
        m.insert(11155111, "https://testnet-rpc.etherspot.io/v1/11155111".to_string());
        m.insert(11155420, "https://testnet-rpc.etherspot.io/v1/11155420".to_string());
        m.insert(28122024, "https://testnet-rpc.etherspot.io/v1/28122024".to_string());

        m
    };
}

// The particle rpc urls
// From: https://docs.particle.network/developers/account-abstraction/available-networks
// Thank you to the Particle team for providing these public endpoints!
lazy_static! {
    pub static ref PARTICLE_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://bundler.particle.network?chainId=1".to_string());
        m.insert(10, "https://bundler.particle.network?chainId=10".to_string());
        m.insert(25, "https://bundler.particle.network?chainId=25".to_string());
        m.insert(56, "https://bundler.particle.network?chainId=56".to_string());
        m.insert(88, "https://bundler.particle.network?chainId=88".to_string());
        m.insert(100, "https://bundler.particle.network?chainId=100".to_string());
        m.insert(108, "https://bundler.particle.network?chainId=108".to_string());
        m.insert(122, "https://bundler.particle.network?chainId=122".to_string());
        m.insert(128, "https://bundler.particle.network?chainId=128".to_string());
        m.insert(137, "https://bundler.particle.network?chainId=137".to_string());
        m.insert(169,  "https://bundler.particle.network?chainId=169".to_string());
        m.insert(196, "https://bundler.particle.network?chainId=196".to_string());
        m.insert(204, "https://bundler.particle.network?chainId=204".to_string());
        m.insert(223, "https://bundler.particle.network?chainId=223".to_string());
        m.insert(250, "https://bundler.particle.network?chainId=250".to_string());
        m.insert(321, "https://bundler.particle.network?chainId=321".to_string());
        m.insert(424, "https://bundler.particle.network?chainId=424".to_string());
        m.insert(1030, "https://bundler.particle.network?chainId=1030".to_string());
        m.insert(1088, "https://bundler.particle.network?chainId=1088".to_string());
        m.insert(1101, "https://bundler.particle.network?chainId=1101".to_string());
        m.insert(1116, "https://bundler.particle.network?chainId=1116".to_string());
        m.insert(1284, "https://bundler.particle.network?chainId=1284".to_string());
        m.insert(1285, "https://bundler.particle.network?chainId=1285".to_string());
        m.insert(1329, "https://bundler.particle.network?chainId=1329".to_string());
        m.insert(1501, "https://bundler.particle.network?chainId=1501".to_string());
        m.insert(2222, "https://bundler.particle.network?chainId=2222".to_string());
        m.insert(2649, "https://bundler.particle.network?chainId=2649".to_string());
        m.insert(2777, "https://bundler.particle.network?chainId=2777".to_string());
        m.insert(3109, "https://bundler.particle.network?chainId=3109".to_string());
        m.insert(3776, "https://bundler.particle.network?chainId=3776".to_string());
        m.insert(4200, "https://bundler.particle.network?chainId=4200".to_string());
        m.insert(4689, "https://bundler.particle.network?chainId=4689".to_string());
        m.insert(5000, "https://bundler.particle.network?chainId=5000".to_string());
        m.insert(7000, "https://bundler.particle.network?chainId=7000".to_string());
        m.insert(7560, "https://bundler.particle.network?chainId=7560".to_string());
        m.insert(8217, "https://bundler.particle.network?chainId=8217".to_string());
        m.insert(8329, "https://bundler.particle.network?chainId=8329".to_string());
        m.insert(8453, "https://bundler.particle.network?chainId=8453".to_string());
        m.insert(9980, "https://bundler.particle.network?chainId=9980".to_string());
        m.insert(11501, "https://bundler.particle.network?chainId=11501".to_string());
        m.insert(17777, "https://bundler.particle.network?chainId=17777".to_string());
        m.insert(22776, "https://bundler.particle.network?chainId=22776".to_string());
        m.insert(27827, "https://bundler.particle.network?chainId=27827".to_string());
        m.insert(34443, "https://bundler.particle.network?chainId=34443".to_string());
        m.insert(42161, "https://bundler.particle.network?chainId=42161".to_string());
        m.insert(42170, "https://bundler.particle.network?chainId=42170".to_string());
        m.insert(42220, "https://bundler.particle.network?chainId=42220".to_string());
        m.insert(42262, "https://bundler.particle.network?chainId=42262".to_string());
        m.insert(42766, "https://bundler.particle.network?chainId=42766".to_string());
        m.insert(43114, "https://bundler.particle.network?chainId=43114".to_string());
        m.insert(59144, "https://bundler.particle.network?chainId=59144".to_string());
        m.insert(60808, "https://bundler.particle.network?chainId=60808".to_string());
        m.insert(81457, "https://bundler.particle.network?chainId=81457".to_string());
        m.insert(167000, "https://bundler.particle.network?chainId=167000".to_string());
        m.insert(210425, "https://bundler.particle.network?chainId=210425".to_string());
        m.insert(534352, "https://bundler.particle.network?chainId=534352".to_string());
        m.insert(810180, "https://bundler.particle.network?chainId=810180".to_string());
        m.insert(2702128, "https://bundler.particle.network?chainId=2702128".to_string());
        m.insert(7777777, "https://bundler.particle.network?chainId=7777777".to_string());
        m.insert(888888888, "https://bundler.particle.network?chainId=888888888".to_string());
        m.insert(1313161554, "https://bundler.particle.network?chainId=1313161554".to_string());
        m.insert(1482601649, "https://bundler.particle.network?chainId=1482601649".to_string());

        // Testnet
        m.insert(5003, "https://bundler.particle.network?chainId=5003".to_string());
        m.insert(10200, "https://bundler.particle.network?chainId=10200".to_string());
        m.insert(59141, "https://bundler.particle.network?chainId=59141".to_string());
        m.insert(58008, "https://bundler.particle.network?chainId=58008".to_string());
        m.insert(80002, "https://bundler.particle.network?chainId=80002".to_string());
        m.insert(84532, "https://bundler.particle.network?chainId=84532".to_string());
        m.insert(91715, "https://bundler.particle.network?chainId=91715".to_string());
        m.insert(421614, "https://bundler.particle.network?chainId=421614".to_string());
        m.insert(713715, "https://bundler.particle.network?chainId=713715".to_string());
        m.insert(11155111, "https://bundler.particle.network?chainId=11155111".to_string());
        m.insert(11155420, "https://bundler.particle.network?chainId=11155420".to_string());
        m.insert(168587773, "https://bundler.particle.network?chainId=168587773".to_string());

        m
    };
}

// The silius rpc urls
// From: https://github.com/silius-rs/silius?tab=readme-ov-file#supported-networks
// Thank you to the Silius team for providing these public endpoints!
lazy_static! {
    pub static ref SILIUS_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://rpc.silius.xyz/api/v1/chain/ethereum-mainnet".to_string());
        m.insert(10, "https://rpc.silius.xyz/api/v1/chain/optimism-mainnet".to_string());
        m.insert(56, "https://rpc.silius.xyz/api/v1/chain/bsc-mainnet".to_string());
        m.insert(137, "https://rpc.silius.xyz/api/v1/chain/polygon-mainnet".to_string());
        m.insert(8453, "https://rpc.silius.xyz/api/v1/chain/base-mainnet".to_string());
        m.insert(42161, "https://rpc.silius.xyz/api/v1/chain/arbitrum-mainnet".to_string());
        m.insert(43114, "https://rpc.silius.xyz/api/v1/chain/avalanche-mainnet".to_string());
        m.insert(59144, "https://rpc.silius.xyz/api/v1/chain/linea-mainnet".to_string());
        m.insert(81457, "https://rpc.silius.xyz/api/v1/chain/blast-mainnet".to_string());

        // Testnet
        m.insert(97, "https://rpc.silius.xyz/api/v1/chain/bsc-testnet".to_string());
        m.insert(43113, "https://rpc.silius.xyz/api/v1/chain/avalanche-fuji".to_string());
        m.insert(80001, "https://rpc.silius.xyz/api/v1/chain/polygon-mumbai".to_string());
        m.insert(84532, "https://rpc.silius.xyz/api/v1/chain/base-sepolia".to_string());
        m.insert(421614, "https://rpc.silius.xyz/api/v1/chain/arbitrum-sepolia".to_string());
        m.insert(11155111, "https://rpc.silius.xyz/api/v1/chain/ethereum-sepolia".to_string());
        m.insert(11155420, "https://rpc.silius.xyz/api/v1/chain/optimism-sepolia".to_string());

        m
    };
}

// The candide rpc urls
// From: https://docs.candide.dev/wallet/bundler/rpc-endpoints/
// Thank you to the Candide team for providing these public endpoints!
lazy_static! {
    #[allow(clippy::let_and_return)]
    pub static ref CANDIDE_RPC_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(137, "https://polygon.voltaire.candidewallet.com/rpc".to_string());

         // Testnet
        m.insert(43113, "https://avalanche-fuji.voltaire.candidewallet.com/rpc".to_string());
        m.insert(44787, "https://celo-alfajores.voltaire.candidewallet.com/rpc".to_string());
        m.insert(80001, "https://mumbai.voltaire.candidewallet.com/rpc".to_string());
        m.insert(11155111, "https://sepolia.voltaire.candidewallet.com/rpc".to_string());

        m
    };
}
