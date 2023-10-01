use lazy_static::lazy_static;
use std::collections::HashMap;

// The graph hosted service rpc urls
lazy_static! {
    pub static ref THE_GRAPH_HOSTED_SERVICE_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://api.thegraph.com/subgraphs/name/lightdotso/mainnet".to_string());
        m.insert(10, "https://api.thegraph.com/subgraphs/name/lightdotso/optimism".to_string());
        m.insert(56, "https://api.thegraph.com/subgraphs/name/lightdotso/bsc".to_string());
        m.insert(100, "https://api.thegraph.com/subgraphs/name/lightdotso/gnosis".to_string());
        m.insert(137, "https://api.thegraph.com/subgraphs/name/lightdotso/matic".to_string());
        m.insert(250, "https://api.thegraph.com/subgraphs/name/lightdotso/fantom".to_string());
        m.insert(1101, "https://api.thegraph.com/subgraphs/name/lightdotso/polygon-zkevm".to_string());
        m.insert(8453, "https://api.thegraph.com/subgraphs/name/lightdotso/base".to_string());
        m.insert(42161, "https://api.thegraph.com/subgraphs/name/lightdotso/arbitrum-one".to_string());
        m.insert(42220, "https://api.thegraph.com/subgraphs/name/lightdotso/celo".to_string());
        m.insert(43114, "https://api.thegraph.com/subgraphs/name/lightdotso/avalanche".to_string());


        // Testnet
        m.insert(80001, "https://api.thegraph.com/subgraphs/name/lightdotso/mumbai".to_string());
        m.insert(11155111, "https://api.thegraph.com/subgraphs/name/lightdotso/sepolia".to_string());

        m
    };
}
