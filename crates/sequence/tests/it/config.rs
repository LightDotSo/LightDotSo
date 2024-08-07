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

use eyre::Result;
use lightdotso_sequence::{
    config::WalletConfig,
    types::{AddressSignatureLeaf, NestedLeaf, SignatureLeaf, Signer, SignerNode, SubdigestLeaf},
    utils::parse_hex_to_bytes32,
};

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_signatures() -> Result<()> {
    let config_1: WalletConfig = WalletConfig {
      signature_type: 0,
      checkpoint: 999999,
      weight: 1,
      threshold: 11,
      image_hash: [0; 32].into(),
      internal_root: None,
      internal_recovered_configs: None,
      tree: SignerNode{
        left: Some(Box::new(SignerNode {
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(2),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse()?,
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed",
                        )
                        ?
                        .into(),
                    }),
                }),
            })),
            signer: None,
        })),
        right: Some(Box::new(SignerNode {
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )
                        ?
                        .into(),
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse()?,
                    }),
                }),
            })),
            signer: None,
        })),
        signer: None
    }};

    let config_2: WalletConfig = WalletConfig {
      signature_type: 0,
      checkpoint: 2,
      weight: 1,
      threshold: 1,
      image_hash: [0; 32].into(),
      internal_root: None,
      internal_recovered_configs: None,
      tree: SignerNode{
        left: Some(Box::new(SignerNode {
            left: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000000",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000001",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                signer: None
            })),
            right: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000002",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000003",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                signer: None,
            })),
            signer: None,
        })),
        right: Some(Box::new(SignerNode {
            left: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000004",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000005",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                signer: None
            })),
            right: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000006",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x0000000000000000000000000000000000000000000000000000000000000007",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                signer: None,
            })),
            signer: None,
        })),
        signer: None
    }};

    let config_3: WalletConfig = WalletConfig {
      signature_type: 0,
      checkpoint: 3,
      weight: 1,
      threshold: 2,
      image_hash: [0; 32].into(),
      internal_root: None,
      internal_recovered_configs: None,
      tree: SignerNode{
        left: Some(Box::new(SignerNode {
            left: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: Some(2),
                            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                                address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse()?,
                            }),
                        }),
                    })),
                    right: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: Some(2),
                            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                hash: parse_hex_to_bytes32(
                                    "0x0000000000000000000000000000000000000000000000000000000000000006",
                                )
                                ?
                                .into(),
                                }),
                        }),
                    })),
                    signer: None
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                            hash: parse_hex_to_bytes32(
                                "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df10000000000000000",
                            )
                            ?
                            .into(),
                        }),
                    }),
                })),
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                        internal_root: [0; 32].into(),
                        internal_threshold: 2,
                        external_weight: 90,
                        size: 3,
                    })
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed",
                        )
                        ?
                        .into(),
                    }),
                }),
            })),
            signer: None,
        })),
        right: Some(Box::new(SignerNode {
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )
                        ?
                        .into(),
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse()?,
                    }),
                }),
            })),
            signer: None,
        })),
        signer: None
    }};

    let mut configs = vec![config_1, config_2, config_3];

    let image_hashes = [
        "0xb32cf48e38905abbd1058a568141c82b1abd0d548df003e019ea86e2824e3caa",
        "0xed7d9160a0bdcdfd9b3b83e29ddb5f94a07c1e4d1c79561b77c9f2d914f293eb",
        "0xc5272cd2176bd13988f3c1ab21994214ff3d84db081f95ee4d28f39d60ec834c",
    ];

    for (i, config) in configs.iter_mut().enumerate() {
        let _ = config.regenerate_image_hash([0; 32]);
        let r = config.image_hash_of_wallet_config()?;
        assert_eq!(r, parse_hex_to_bytes32(image_hashes[i])?);
    }

    Ok(())
}
