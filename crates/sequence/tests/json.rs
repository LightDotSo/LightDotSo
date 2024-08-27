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

use alloy::primitives::Address;
use eyre::Result;
use lightdotso_sequence::{
    config::WalletConfig,
    io::{read_wallet_config, write_wallet_config},
    types::{
        AddressSignatureLeaf, BranchLeaf, DynamicSignatureLeaf, DynamicSignatureType,
        ECDSASignatureLeaf, ECDSASignatureType, NestedLeaf, NodeLeaf, Signature, SignatureLeaf,
        Signer, SignerNode, SubdigestLeaf,
    },
};

#[test]
fn test_wallet_config_from_json() -> Result<()> {
    // Load JSON from file
    let wallet_config = read_wallet_config("tests/samples/sample1_out.json")?;

    // Parse JSON to WalletConfig
    // let wallet_config: WalletConfig = serde_json::from_str(&wallet_config_json)?;

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", &wallet_config.checkpoint);
    // add more tests...

    Ok(())
}

#[test]
fn test_wallet_ecdsa_to_json() -> Result<()> {
    let ecdsa_leaf = ECDSASignatureLeaf {
        address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse()?,
        signature_type: ECDSASignatureType::ECDSASignatureTypeEIP712,
        signature: [0u8; 65].into(),
    };

    let config = WalletConfig {
        signature_type: 0,
        checkpoint: 0,
        threshold: 0,
        weight: 0,
        internal_root: Some([0; 32].into()),
        image_hash: [0; 32].into(),
        internal_recovered_configs: None,
        tree: SignerNode {
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::ECDSASignature(ecdsa_leaf),
            }),
            left: None,
            right: None,
        },
    };

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", config.checkpoint);

    // Write WalletConfig back to a different JSON file
    write_wallet_config(&config, "tests/samples/sample2_out.json")?;

    let wallet_config = read_wallet_config("tests/samples/sample2_out.json")?;

    // Parse JSON to WalletConfig
    // let wallet_config: WalletConfig = serde_json::from_str(&wallet_config_json)?;

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", &wallet_config.checkpoint);
    // add more tests...

    Ok(())
}

#[test]
fn test_wallet_complex_to_json() -> Result<()> {
    let ecdsa_leaf = ECDSASignatureLeaf {
        address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse()?,
        signature_type: ECDSASignatureType::ECDSASignatureTypeEIP712,
        signature: [0u8; 65].into(),
    };

    let config = WalletConfig {
        signature_type: 0,
        checkpoint: 0,
        threshold: 0,
        weight: 0,
        internal_root: Some([0; 32].into()),
        image_hash: [0; 32].into(),
        internal_recovered_configs: None,
        tree: SignerNode {
            signer: Some(Signer {
                weight: None,
                leaf: SignatureLeaf::ECDSASignature(ecdsa_leaf.clone()),
            }),
            left: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: None,
                            leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
                        }),
                    })),
                    right: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: Some(2),
                            leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                                internal_root: [0; 32].into(),
                                internal_threshold: 0,
                                external_weight: 0,
                                size: 3,
                            }),
                        }),
                    })),
                    signer: Some(Signer {
                        weight: Some(1),
                        leaf: SignatureLeaf::DynamicSignature(DynamicSignatureLeaf {
                            address: Address::zero(),
                            signature_type: DynamicSignatureType::DynamicSignatureTypeEIP1271,
                            signature: Signature([0u8; 65].to_vec()),
                            size: 3,
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: [0; 32].into(),
                        }),
                    }),
                })),
                signer: Some(Signer {
                    weight: Some(2),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x1111111111111111111111111111111111111111".parse()?,
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(2),
                    leaf: SignatureLeaf::BranchSignature(BranchLeaf { size: 3 }),
                }),
            })),
        },
    };

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", config.checkpoint);

    // Write WalletConfig back to a different JSON file
    write_wallet_config(&config, "tests/samples/sample3_out.json")?;

    let wallet_config = read_wallet_config("tests/samples/sample3_out.json")?;

    // Parse JSON to WalletConfig
    // let wallet_config: WalletConfig = serde_json::from_str(&wallet_config_json)?;

    // Now you can use your WalletConfig struct
    println!("Checkpoint: {}", &wallet_config.checkpoint);

    // add more tests...
    Ok(())
}
