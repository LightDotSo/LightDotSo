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
    module::SigModule,
    types::{AddressSignatureLeaf, NestedLeaf, NodeLeaf, SignatureLeaf, Signer, SignerNode},
    utils::parse_hex_to_bytes32,
};

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_node_simple() {
    let module = SigModule::new(
        Address::zero(),
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
                        address: "0x1111111111111111111111111111111111111111".parse().unwrap(),
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(3),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x2222222222222222222222222222222222222222".parse().unwrap(),
                    }),
                }),
            })),
        }),
    );

    let config = module.get_computed_config(5, 1).unwrap();
    let expected_image_hash =
        parse_hex_to_bytes32("0xd491b760c0ac4b1572e361f32e3c349a8db7886b683226014764019465a52592")
            .unwrap();

    assert_eq!(expected_image_hash, config.image_hash_of_wallet_config().unwrap(),);
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_node_nested() {
    let module = SigModule::new(
        Address::zero(),
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
                        address: "0x1111111111111111111111111111111111111111".parse().unwrap(),
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
                            address: "0x2222222222222222222222222222222222222222".parse().unwrap(),
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(1),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0x3333333333333333333333333333333333333333".parse().unwrap(),
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
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
            })),
        }),
    );

    let config = module.get_computed_config(5, 1).unwrap();
    let expected_image_hash =
        parse_hex_to_bytes32("0xc83d0ede0503ae162a564017b956537c733d1253e2e42a9dccd757dc25b46cd5")
            .unwrap();

    assert_eq!(expected_image_hash, config.image_hash_of_wallet_config().unwrap());
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_node_complex() {
    let module = SigModule::new(
        Address::zero(),
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
                            address: "0x1111111111111111111111111111111111111111".parse().unwrap(),
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(3),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0x2222222222222222222222222222222222222222".parse().unwrap(),
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
                            address: "0x3333333333333333333333333333333333333333".parse().unwrap(),
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
                                address: "0x4444444444444444444444444444444444444444"
                                    .parse()
                                    .unwrap(),
                            }),
                        }),
                    })),
                    right: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: Some(1),
                            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                                address: "0x5555555555555555555555555555555555555555"
                                    .parse()
                                    .unwrap(),
                            }),
                        }),
                    })),
                    signer: Some(Signer {
                        weight: Some(1),
                        leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                            external_weight: 2,
                            internal_threshold: 1,
                            internal_root: [0; 32].into(),
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

    let config = module.get_computed_config(5, 1).unwrap();
    let expected_image_hash =
        parse_hex_to_bytes32("0xc9761153e2633291df0b2f139ec3f4d05e5d89ce21576e6e7cc533320609b8fe")
            .unwrap();

    assert_eq!(config.image_hash_of_wallet_config().unwrap(), expected_image_hash);
}
