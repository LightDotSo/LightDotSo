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

use crate::types::{SignatureLeaf, SignerNode};
use eyre::{eyre, Result};

pub fn rooted_sort_nested(node: SignerNode) -> Result<SignerNode> {
    // Get the signers from the node
    let signers = node.get_signers();

    let mut acc = SignerNode { signer: Some(signers[0].clone()), left: None, right: None };
    for signer in signers.iter().skip(1) {
        let node = SignerNode { signer: Some(signer.clone()), left: None, right: None };
        acc = SignerNode { signer: None, left: Some(Box::new(acc)), right: Some(Box::new(node)) }
    }
    Ok(acc)
}

pub fn rooted_node_builder(members: Vec<SignerNode>) -> Result<SignerNode> {
    if members.is_empty() {
        return Err(eyre!("Empty members vector"));
    }

    // If SignerNode has a nested signature, it must be root sorted
    for mut member in members.iter() {
        if let Some(signer) = &member.signer {
            if let SignatureLeaf::NestedSignature(_) = &signer.leaf {
                member = &rooted_sort_nested(member.clone())?;
            }
        }
    }

    let mut acc = members[0].clone();
    for member in members.iter().skip(1) {
        acc = SignerNode {
            signer: None,
            left: Some(Box::new(acc)),
            right: Some(Box::new(member.clone())),
        }
    }
    Ok(acc)
}

#[cfg(test)]
mod tests {
    use crate::{
        types::{AddressSignatureLeaf, NestedLeaf, SignatureLeaf, Signer, SubdigestLeaf},
        utils::parse_hex_to_bytes32,
    };

    use super::*;

    #[test]
    fn test_config_1() {
        let members = vec![
            SignerNode {
                signer: Some(Signer {
                    weight: Some(2),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse().unwrap(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse().unwrap(),
                    }),
                }),
                left: None,
                right: None,
            },
        ];

        let node = rooted_node_builder(members).unwrap();
        insta::assert_debug_snapshot!(node);
    }

    #[test]
    fn test_config_2() {
        let members = vec![
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000000",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000001",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000002",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000003",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000004",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000005",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000006",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000007",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
        ];

        let node = rooted_node_builder(members).unwrap();
        insta::assert_debug_snapshot!(node);
    }

    #[test]
    fn test_config_3() {
        let members = vec![
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                        internal_root: [0; 32].into(),
                        internal_threshold: 0,
                        external_weight: 3,
                    }),
                }),
                left: Some(Box::new(
                    SignerNode {
                        signer: None,
                        left: Some(Box::new(
                            SignerNode {
                                signer: Some(Signer {
                                    weight: Some(2),
                                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                                        address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse().unwrap(),
                                    }),
                                }),
                                left: None,
                                right: None,
                            },
                        )),
                        right: Some(Box::new(
                            SignerNode {
                                signer: Some(Signer {
                                    weight: None,
                                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                        hash: parse_hex_to_bytes32(
                                            "0x0000000000000000000000000000000000000000000000000000000000000006",
                                        )
                                        .unwrap()
                                        .into(),
                                    }),
                                }),
                                left: None,
                                right: None,
                            },
                        )),
                    },
                )),
                right: Some(Box::new(
                    SignerNode {
                        signer: Some(Signer {
                            weight: None,
                            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                hash: parse_hex_to_bytes32(
                                    "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df10000000000000000",
                                )
                                .unwrap()
                                .into(),
                            }),
                        }),
                        left: None,
                        right: None,
                    },
                )),
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse().unwrap(),
                    }),
                }),
                left: None,
                right: None,
            },
        ];

        let node = rooted_node_builder(members).unwrap();
        insta::assert_debug_snapshot!(node);
    }
}
