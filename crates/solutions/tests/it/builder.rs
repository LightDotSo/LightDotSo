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
use lightdotso_solutions::{
    builder::rooted_node_builder,
    recover::recover_signature,
    types::SignerNode,
    utils::{from_hex_string, parse_hex_to_bytes32},
};

// https://sepolia.etherscan.io/tx/0x4dcceb715de1825bee83424e2385a7ed2cc00af70d883ff25aaa29f2c6efbd68
const SIGNATURES: &[&str] = &[
    "0x0100010000000001014fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed00012395bc3e577accfb42eaa452519853a168ca8bd8267063b73957a684c2583a0066a37fe568c1d5e918e98d2a99d6d6e0f0b8448ff704283c7757a82fd37b9dfa1b02",
];

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_rooted_builder() {
    for (i, signature) in SIGNATURES.iter().enumerate() {
        println!("{}", i);

        let sig = from_hex_string(signature).unwrap().into();
        // Notice that the recovered addresses are hypothetical as we don't have the original
        // user_op_hash that was used for the subdigest.
        let user_op_hash = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();

        let config = recover_signature(Address::zero(), 1, user_op_hash, sig).await.unwrap();

        println!("signers: {:?}", config.tree.get_signers());

        let signers = config.tree.get_signers();
        let signer_nodes = signers
            .iter()
            .map(|s| SignerNode { signer: Some(s.clone()), left: None, right: None })
            .collect::<Vec<_>>();

        // Build the tree
        let new_config_tree = rooted_node_builder(signer_nodes).unwrap();

        println!("new signer tree: {:?}", new_config_tree.clone());
        println!("signers tree: {:?}", config.tree);

        insta::assert_debug_snapshot!(format!("{}-config", i.to_string()), config.clone().tree);
        insta::assert_debug_snapshot!(format!("{}-config", i.to_string()), new_config_tree.clone());
    }
}
