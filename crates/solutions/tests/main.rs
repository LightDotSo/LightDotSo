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
    io::{read_wallet_config, write_wallet_config},
    types::{
        AddressSignatureLeaf, BranchLeaf, ECDSASignatureLeaf, ECDSASignatureType, NestedLeaf,
        NodeLeaf, SignatureLeaf, Signer, SignerNode, WalletConfig,
    },
};

#[test]
fn test_wallet_config_from_json() {
    // Load JSON from file
    let wallet_config = read_wallet_config("tests/samples/sample1_out.json").unwrap();

    // Parse JSON to WalletConfig
    // let wallet_config: WalletConfig = serde_json::from_str(&wallet_config_json).unwrap();

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", &wallet_config.checkpoint);
    // add more tests...
}

#[test]
fn test_wallet_ecdsa_to_json() {
    let ecdsa_leaf = ECDSASignatureLeaf {
        address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse().unwrap(),
        signature_type: ECDSASignatureType::ECDSASignatureTypeEIP712,
        signature: [0u8; 65].into(),
    };

    let config = WalletConfig {
        checkpoint: 0,
        threshold: 0,
        weight: 0,
        internal_root: Some([0; 32].into()),
        image_hash: [0; 32].into(),
        tree: SignerNode {
            signer: Some(Signer { weight: 1, leaf: SignatureLeaf::ECDSASignature(ecdsa_leaf) }),
            left: None,
            right: None,
        },
    };

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", config.checkpoint);

    // Write WalletConfig back to a different JSON file
    write_wallet_config(&config, "tests/samples/sample2_out.json").unwrap();

    let wallet_config = read_wallet_config("tests/samples/sample2_out.json").unwrap();

    // Parse JSON to WalletConfig
    // let wallet_config: WalletConfig = serde_json::from_str(&wallet_config_json).unwrap();

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", &wallet_config.checkpoint);
    // add more tests...
}

#[test]
fn test_wallet_complex_to_json() {
    let ecdsa_leaf = ECDSASignatureLeaf {
        address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse().unwrap(),
        signature_type: ECDSASignatureType::ECDSASignatureTypeEIP712,
        signature: [0u8; 65].into(),
    };

    let config = WalletConfig {
        checkpoint: 0,
        threshold: 0,
        weight: 0,
        internal_root: Some([0; 32].into()),
        image_hash: [0; 32].into(),
        tree: SignerNode {
            signer: Some(Signer {
                weight: 1,
                leaf: SignatureLeaf::ECDSASignature(ecdsa_leaf.clone()),
            }),
            left: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: 2,
                            leaf: SignatureLeaf::NodeSignature(NodeLeaf {}),
                        }),
                    })),
                    right: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: 2,
                            leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                                internal_root: [0; 32].into(),
                                internal_threshold: 0,
                                external_weight: 0,
                                address: Address::zero(),
                            }),
                        }),
                    })),
                    signer: Some(Signer {
                        weight: 2,
                        leaf: SignatureLeaf::ECDSASignature(ecdsa_leaf),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: 2,
                        leaf: SignatureLeaf::BranchSignature(BranchLeaf {}),
                    }),
                })),
                signer: Some(Signer {
                    weight: 3,
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x1111111111111111111111111111111111111111".parse().unwrap(),
                    }),
                }),
            })),
            right: None,
        },
    };

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", config.checkpoint);

    // Write WalletConfig back to a different JSON file
    write_wallet_config(&config, "tests/samples/sample3_out.json").unwrap();

    let wallet_config = read_wallet_config("tests/samples/sample3_out.json").unwrap();

    // Parse JSON to WalletConfig
    // let wallet_config: WalletConfig = serde_json::from_str(&wallet_config_json).unwrap();

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", &wallet_config.checkpoint);
    // add more tests...
}
