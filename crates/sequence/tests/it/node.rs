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
    module::SigModule,
    types::{AddressSignatureLeaf, NestedLeaf, NodeLeaf, SignatureLeaf, Signer, SignerNode},
    utils::parse_hex_to_bytes32,
};

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_node_simple() -> Result<()> {
    let module = SigModule::new(
        Address::ZERO,
        1,
        [0; 32],
        Some(SignerNode {
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
            }),
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(3),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x1111111111111111111111111111111111111111".parse()?,
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(3),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x2222222222222222222222222222222222222222".parse()?,
                    }),
                }),
            })),
        }),
    );

    let config = module.get_computed_config(5, 1)?;
    let expected_image_hash =
        parse_hex_to_bytes32("0xd491b760c0ac4b1572e361f32e3c349a8db7886b683226014764019465a52592")?;

    assert_eq!(expected_image_hash, config.image_hash_of_wallet_config()?,);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_node_nested() -> Result<()> {
    let module = SigModule::new(
        Address::ZERO,
        1,
        [0; 32],
        Some(SignerNode {
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
            }),
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(3),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x1111111111111111111111111111111111111111".parse()?,
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(1),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0x2222222222222222222222222222222222222222".parse()?,
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(1),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0x3333333333333333333333333333333333333333".parse()?,
                        }),
                    }),
                })),
                signer: Some(Signer {
                    weight: Some(2),
                    leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                        external_weight: 2,
                        internal_threshold: 1,
                        internal_root: parse_hex_to_bytes32(
                            "0x5eef3b121e46ef31a9565af83a3e96e31a98a64d52cf22d20259a1a01cee9972",
                        )?
                        .into(),
                        size: 3,
                    }),
                }),
            })),
        }),
    );

    let config = module.get_computed_config(5, 1)?;
    let expected_image_hash =
        parse_hex_to_bytes32("0xc83d0ede0503ae162a564017b956537c733d1253e2e42a9dccd757dc25b46cd5")?;

    assert_eq!(expected_image_hash, config.image_hash_of_wallet_config()?);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_node_complex() -> Result<()> {
    let module = SigModule::new(
        Address::ZERO,
        1,
        [0; 32],
        Some(SignerNode {
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
            }),
            left: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(3),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0x1111111111111111111111111111111111111111".parse()?,
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(3),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0x2222222222222222222222222222222222222222".parse()?,
                        }),
                    }),
                })),
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(2),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0x3333333333333333333333333333333333333333".parse()?,
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: Some(1),
                            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                                address: "0x4444444444444444444444444444444444444444".parse()?,
                            }),
                        }),
                    })),
                    right: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: Some(1),
                            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                                address: "0x5555555555555555555555555555555555555555".parse()?,
                            }),
                        }),
                    })),
                    signer: Some(Signer {
                        weight: Some(1),
                        leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                            external_weight: 2,
                            internal_threshold: 1,
                            internal_root: [0; 32].into(),
                            size: 3,
                        }),
                    }),
                })),
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
                }),
            })),
        }),
    );

    let config = module.get_computed_config(5, 1)?;
    let expected_image_hash =
        parse_hex_to_bytes32("0xc9761153e2633291df0b2f139ec3f4d05e5d89ce21576e6e7cc533320609b8fe")?;

    assert_eq!(config.image_hash_of_wallet_config()?, expected_image_hash);

    Ok(())
}
