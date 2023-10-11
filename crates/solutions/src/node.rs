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

use crate::{
    types::{SignatureLeaf, SignerNode},
    utils::{hash_keccak_256, left_pad_u16_to_bytes32, left_pad_u8_to_bytes32},
};
use ethers::{
    abi::{encode_packed, Token},
    types::{Address, U256},
    utils::keccak256,
};

/// Generates a leaf node for the merkle tree
pub fn leaf_for_address_and_weight(addr: Address, weight: u8) -> [u8; 32] {
    let weight_shifted = U256::from(weight) << 160;
    let addr_u256 = U256::from_big_endian(addr.as_bytes());
    (weight_shifted | addr_u256).into()
}

/// Recovers the wallet config from the signature
pub fn leaf_for_nested(
    internal_root: [u8; 32],
    internal_threshold: u16,
    external_weight: u8,
) -> [u8; 32] {
    keccak256(
        ethers::abi::encode_packed(&[
            Token::String("Sequence nested config:\n".to_string()),
            Token::FixedBytes(internal_root.to_vec()),
            Token::FixedBytes(left_pad_u16_to_bytes32(internal_threshold).to_vec()),
            Token::FixedBytes(left_pad_u8_to_bytes32(external_weight).to_vec()),
        ])
        .unwrap(),
    )
}

/// Recovers the wallet config from the signature
pub fn leaf_for_hardcoded_subdigest(hardcoded_subdigest: [u8; 32]) -> [u8; 32] {
    keccak256(
        encode_packed(&[
            Token::String("Sequence static digest:\n".to_string()),
            Token::FixedBytes(hardcoded_subdigest.to_vec()),
        ])
        .unwrap(),
    )
}

impl SignerNode {
    fn get_node_hash(&self, subdigest: [u8; 32]) -> [u8; 32] {
        let left = if self.left.is_some() {
            self.left.as_ref().unwrap().calculate_image_hash_from_node(subdigest)
        } else {
            [0; 32]
        };
        let right = if self.right.is_some() {
            self.right.as_ref().unwrap().calculate_image_hash_from_node(subdigest)
        } else {
            [0; 32]
        };

        hash_keccak_256(left, right)
    }

    // Iterate over the tree and calculate the image hash
    pub fn calculate_image_hash_from_node(&self, subdigest: [u8; 32]) -> [u8; 32] {
        let res = match &self.signer {
            Some(signer) => match &signer.leaf {
                SignatureLeaf::ECDSASignature(ref leaf) => {
                    leaf_for_address_and_weight(leaf.address, signer.weight.unwrap())
                }
                SignatureLeaf::AddressSignature(ref leaf) => {
                    leaf_for_address_and_weight(leaf.address, signer.weight.unwrap())
                }
                SignatureLeaf::DynamicSignature(ref leaf) => {
                    leaf_for_address_and_weight(leaf.address, signer.weight.unwrap())
                }
                SignatureLeaf::NodeSignature(_) => self.get_node_hash(subdigest),
                SignatureLeaf::SubdigestSignature(leaf) => {
                    leaf_for_hardcoded_subdigest(leaf.hash.into())
                }
                SignatureLeaf::NestedSignature(ref leaf) => {
                    let node_hash = self.get_node_hash(subdigest);
                    leaf_for_nested(node_hash, leaf.internal_threshold, leaf.external_weight)
                }
                SignatureLeaf::BranchSignature(_) => [0; 32],
            },
            None => [0; 32],
        };

        // Return if not empty
        if res != [0; 32] {
            return res;
        }

        self.get_node_hash(subdigest)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        types::{AddressSignatureLeaf, NestedLeaf, Signer, SubdigestLeaf},
        utils::parse_hex_to_bytes32,
    };

    #[test]
    fn test_leaf_for_address_and_weight() {
        let test_addr = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse::<Address>().unwrap();
        let test_weight = 1;
        let expected_output = parse_hex_to_bytes32(
            "0x0000000000000000000000014fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed",
        )
        .unwrap();

        let result = leaf_for_address_and_weight(test_addr, test_weight);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_leaf_for_nested() {
        let test_node = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let test_threshold = 1;
        let expected_output = parse_hex_to_bytes32(
            "0x907152f3fb1d245b378d4a00af6de7e68f3458fdfbeab39db0e2fb84c676e449",
        )
        .unwrap();

        let result = leaf_for_nested(test_node, test_threshold, 1);
        println!("{:?}", result);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_leaf_for_hardcoded_subdigest() {
        let test_hardcoded_digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let expected_output = parse_hex_to_bytes32(
            "0x1773e5bd11cd42e98b2e68005291627c91f4554148dd1a0e3941a681d892b516",
        )
        .unwrap();

        let result = leaf_for_hardcoded_subdigest(test_hardcoded_digest);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_hash_signature_leaf_address() {
        let leaf = SignerNode {
            signer: Some(Signer {
                weight: Some(129),
                leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                    address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse().unwrap(),
                }),
            }),
            left: None,
            right: None,
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x00000000000000000000008107ab71fe97f9122a2dbe3797aa441623f5a59db1",
        )
        .unwrap();
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32]))
    }

    #[test]
    fn test_hash_signature_leaf_subdigest() {
        let leaf = SignerNode {
            signer: Some(Signer {
                weight: Some(129),
                leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                    hash: parse_hex_to_bytes32(
                        "0xb38b3da0ef56c3094675167fed4a263c3346b325dddb6e56a3eb9a10ed7539ed",
                    )
                    .unwrap()
                    .into(),
                }),
            }),
            left: None,
            right: None,
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x7cf15e50f6d44f71912ca6575b7fd911a5c6f19d0195692c7d35a102ad5ae98b",
        )
        .unwrap();
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32]));
    }

    #[test]
    fn test_hash_signature_leaf_nested() {
        let leaf = SignerNode {
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                    internal_root: [0; 32].into(),
                    internal_threshold: 211,
                    external_weight: 90,
                })
            }),
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(2),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse().unwrap(),
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: Some(Box::new(SignerNode {
                    left: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: None,
                            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                hash: parse_hex_to_bytes32("0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed").unwrap().into()
                            }),
                        }),
                    })),
                    right: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: None,
                            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                hash: parse_hex_to_bytes32("0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60").unwrap().into()
                            }),
                        }),
                    })),
                    signer: None,
                })),
                right: Some(Box::new(SignerNode {
                    left: None,
                    right: None,
                    signer: Some(Signer {
                        weight: Some(1),
                        leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                            address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse().unwrap(),
                        }),
                    }),
                })),
                signer: None,
            })),
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x6cca65d12b31379a7b429e43443969524821e57d2c6a7fafae8e30bd31a5295b",
        )
        .unwrap();
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32]));
    }

    #[test]
    fn test_hash_signature_leaf_node() {
        let leaf = SignerNode {
            signer: None,
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(129),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse().unwrap(),
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
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )
                        .unwrap()
                        .into(),
                    }),
                }),
            })),
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x47dcfac6c5622054a0ac762baa1a5eb10705484ea1e000869bbc11a093bec97e",
        )
        .unwrap();
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32]));
    }
}
