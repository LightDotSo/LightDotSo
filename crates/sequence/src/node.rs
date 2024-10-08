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

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![allow(clippy::unwrap_used)]

use crate::{
    types::{NodeLeaf, SignatureLeaf, Signer, SignerNode},
    utils::{hash_keccak_256, left_pad_u16_to_bytes32, left_pad_u8_to_bytes32},
};
use alloy::{
    dyn_abi::DynSolValue,
    primitives::{keccak256, Address, FixedBytes, U256},
};
use eyre::{eyre, Result};

/// Generates a leaf node for the merkle tree
pub fn leaf_for_address_and_weight(addr: Address, weight: u8) -> Result<[u8; 32]> {
    let weight_shifted: U256 = U256::from(weight) << 160;
    let addr_u256: U256 = U256::from_be_slice(addr.as_ref());
    let combined = weight_shifted | addr_u256;
    let combined_bytes: [u8; 32] = combined.to_be_bytes();
    Ok(combined_bytes)
}

/// Recovers the wallet config from the signature
pub fn leaf_for_nested(
    internal_root: [u8; 32],
    internal_threshold: u16,
    external_weight: u8,
) -> Result<[u8; 32]> {
    Ok(*keccak256(
        DynSolValue::Tuple(vec![
            DynSolValue::String("Sequence nested config:\n".to_string()),
            DynSolValue::FixedBytes(FixedBytes::from(internal_root), internal_root.len()),
            DynSolValue::FixedBytes(
                FixedBytes::from(left_pad_u16_to_bytes32(internal_threshold)),
                internal_root.len(),
            ),
            DynSolValue::FixedBytes(
                FixedBytes::from(left_pad_u8_to_bytes32(external_weight)),
                internal_root.len(),
            ),
        ])
        .abi_encode_packed(),
    ))
}

/// Recovers the wallet config from the signature
pub fn leaf_for_hardcoded_subdigest(hardcoded_subdigest: [u8; 32]) -> Result<[u8; 32]> {
    Ok(*keccak256(
        DynSolValue::Tuple(vec![
            DynSolValue::String("Sequence static digest:\n".to_string()),
            DynSolValue::FixedBytes(
                FixedBytes::from(hardcoded_subdigest),
                hardcoded_subdigest.len(),
            ),
        ])
        .abi_encode_packed(),
    ))
}

impl SignerNode {
    fn get_node_hash(&self, subdigest: [u8; 32]) -> Result<[u8; 32]> {
        let left = if self.left.is_some() {
            self.left.as_ref().unwrap().calculate_image_hash_from_node(subdigest)?
        } else {
            [0; 32]
        };
        let right = if self.right.is_some() {
            self.right.as_ref().unwrap().calculate_image_hash_from_node(subdigest)?
        } else {
            [0; 32]
        };

        Ok(hash_keccak_256(left, right))
    }

    // Iterate over the tree and calculate the image hash
    pub fn calculate_image_hash_from_node(&self, subdigest: [u8; 32]) -> Result<[u8; 32]> {
        let res = match &self.signer {
            Some(signer) => match &signer.leaf {
                SignatureLeaf::ECDSASignature(ref leaf) => {
                    leaf_for_address_and_weight(leaf.address, signer.weight.unwrap())?
                }
                SignatureLeaf::AddressSignature(ref leaf) => {
                    leaf_for_address_and_weight(leaf.address, signer.weight.unwrap())?
                }
                SignatureLeaf::DynamicSignature(ref leaf) => {
                    leaf_for_address_and_weight(leaf.address, signer.weight.unwrap())?
                }
                SignatureLeaf::NodeSignature(_) => self.get_node_hash(subdigest)?,
                SignatureLeaf::SubdigestSignature(leaf) => {
                    leaf_for_hardcoded_subdigest(leaf.hash.into())?
                }
                SignatureLeaf::NestedSignature(ref leaf) => {
                    let node_hash = self.get_node_hash(subdigest)?;
                    leaf_for_nested(node_hash, leaf.internal_threshold, leaf.external_weight)?
                }
                SignatureLeaf::BranchSignature(_) => [0; 32],
            },
            None => [0; 32],
        };

        // Return if not empty
        if res != [0; 32] {
            return Ok(res);
        }

        self.get_node_hash(subdigest)
    }

    pub fn get_signers(&self) -> Vec<Signer> {
        let mut signers = Vec::new();

        // Add the signers from the left
        if let Some(left) = &self.left {
            signers.extend(left.get_signers());
        }

        // Add the sigers is not empty
        if let Some(signer) = &self.signer {
            signers.push(signer.clone());
        }

        // Add the signers from the right
        if let Some(right) = &self.right {
            signers.extend(right.get_signers());
        }

        signers
    }

    pub fn encode_hash_from_signers(&self) -> Result<Vec<u8>> {
        let signers = self.get_signers();

        // Set the encoding
        let mut encoded = Vec::new();

        // Iterate over the signers and encode them
        for signer in signers.iter() {
            let encoded_signer = match &signer.leaf {
                SignatureLeaf::ECDSASignature(leaf) => [
                    // Flag to indicate that the leaf is an ECDSA signature
                    vec![0x0],
                    // Assume that the weight is always encoded inside an ECDSA signature
                    signer.weight.ok_or(eyre!("No weight found"))?.to_be_bytes().to_vec(),
                    // Encode the signature for the leaf
                    Vec::<u8>::from(leaf),
                ]
                .concat(),
                SignatureLeaf::AddressSignature(leaf) => [
                    // Flag to indicate that the leaf is an ECDSA signature
                    vec![0x1],
                    // Assume that the weight is always encoded inside an ECDSA signature
                    signer.weight.ok_or(eyre!("No weight found"))?.to_be_bytes().to_vec(),
                    // Encode the signature for the leaf
                    Vec::<u8>::from(leaf),
                ]
                .concat(),
                SignatureLeaf::DynamicSignature(leaf) => [
                    // Flag to indicate that the leaf is an ECDSA signature
                    vec![0x2],
                    // Assume that the weight is always encoded inside an ECDSA signature
                    signer.weight.ok_or(eyre!("No weight found"))?.to_be_bytes().to_vec(),
                    // Encode the signature for the leaf
                    Vec::<u8>::from(leaf),
                ]
                .concat(),
                SignatureLeaf::NodeSignature(leaf) => [
                    // Flag to indicate that the leaf is an node
                    vec![0x3],
                    // Encode the signature for the leaf
                    Vec::<u8>::from(leaf),
                ]
                .concat(),
                SignatureLeaf::BranchSignature(leaf) => [
                    // Flag to indicate that the leaf is an node
                    vec![0x4],
                    // Encode the signature for the leaf
                    Vec::<u8>::from(leaf),
                ]
                .concat(),
                SignatureLeaf::SubdigestSignature(leaf) => [
                    // Flag to indicate that the leaf is an node
                    vec![0x5],
                    // Encode the signature for the leaf
                    Vec::<u8>::from(leaf),
                ]
                .concat(),
                SignatureLeaf::NestedSignature(leaf) => [
                    // Flag to indicate that the leaf is an node
                    vec![0x6],
                    // Encode the signature for the leaf
                    Vec::<u8>::from(leaf),
                ]
                .concat(),
            };

            encoded.extend(encoded_signer);
        }

        Ok(encoded)
    }

    pub fn reduce_node_leaf(&mut self) -> Result<()> {
        if self.left.is_some() &&
            self.right.is_some() &&
            self.left.as_ref().unwrap().signer.is_some() &&
            self.right.as_ref().unwrap().signer.is_some()
        {
            // If left and right are both AddressSignature, then we can reduce them
            if let SignatureLeaf::AddressSignature(left_leaf) =
                &self.left.as_ref().unwrap().signer.as_ref().unwrap().leaf
            {
                if let SignatureLeaf::AddressSignature(right_leaf) =
                    &self.right.as_ref().unwrap().signer.as_ref().unwrap().leaf
                {
                    // Hash the two addresses leafs
                    let left_hash = leaf_for_address_and_weight(
                        left_leaf.address,
                        self.left.as_ref().unwrap().signer.as_ref().unwrap().weight.unwrap(),
                    )?;
                    let right_hash = leaf_for_address_and_weight(
                        right_leaf.address,
                        self.right.as_ref().unwrap().signer.as_ref().unwrap().weight.unwrap(),
                    )?;
                    let hash = hash_keccak_256(left_hash, right_hash);

                    // Reduce the node
                    self.signer = Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: hash.into() }),
                    });
                    self.left = None;
                    self.right = None;

                    return Ok(());
                }
            }

            // If left and right are both NodeSignature, then we can reduce them
            if let SignatureLeaf::NodeSignature(left_leaf) =
                &self.left.as_ref().unwrap().signer.as_ref().unwrap().leaf
            {
                if let SignatureLeaf::NodeSignature(right_leaf) =
                    &self.right.as_ref().unwrap().signer.as_ref().unwrap().leaf
                {
                    // Hash the two addresses leafs
                    let left_hash = left_leaf.hash;
                    let right_hash = right_leaf.hash;
                    let hash = hash_keccak_256(left_hash.into(), right_hash.into());

                    // Reduce the node
                    self.signer = Some(Signer {
                        weight: None,
                        leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: hash.into() }),
                    });
                    self.left = None;
                    self.right = None;
                }
            }
        }

        // Traverse the tree if not match
        if self.left.is_some() {
            self.left.as_mut().unwrap().reduce_node_leaf()?;
        }
        if self.right.is_some() {
            self.right.as_mut().unwrap().reduce_node_leaf()?;
        }

        Ok(())
    }

    pub fn reduce_node(&mut self) -> SignerNode {
        if self.signer.is_some() {
            if let SignatureLeaf::BranchSignature(_) = &self.signer.as_ref().unwrap().leaf {
                if self.signer.as_ref().unwrap().weight.unwrap() == 0 {
                    let _ = self.reduce_node_leaf();
                }
            }
        }

        // Traverse the tree if not match
        if self.left.is_some() {
            self.left = Some(Box::new(self.left.as_mut().unwrap().reduce_node()));
        }
        if self.right.is_some() {
            self.right = Some(Box::new(self.right.as_mut().unwrap().reduce_node()));
        }

        // Finally, reduce the root signer if it is a branch signature and the weight is 0
        if self.signer.is_some() {
            // If the weight is 0 and is a branch signature, then we can reduce it
            if let SignatureLeaf::BranchSignature(_) = &self.signer.as_ref().unwrap().leaf {
                if self.signer.as_ref().unwrap().weight.unwrap() == 0 {
                    // Reduce the node
                    self.signer = None;
                }
            }
        }

        self.clone()
    }

    pub fn replace_node(&mut self, nodes: Vec<SignerNode>) -> SignerNode {
        if self.signer.is_some() {
            if let SignatureLeaf::AddressSignature(leaf) = &self.signer.as_ref().unwrap().leaf {
                // If the signer is an address, then we can replace it if it matches
                if let Some(node) = nodes.iter().find(|node| {
                    if let SignatureLeaf::ECDSASignature(node_leaf) =
                        &node.signer.as_ref().unwrap().leaf
                    {
                        return node_leaf.address == leaf.address;
                    }
                    false
                }) {
                    // Replace the node
                    self.signer = node.signer.clone();
                    self.left = node.left.clone();
                    self.right = node.right.clone();
                    return self.clone();
                }
            }
        }

        // Traverse the tree if not match
        if self.left.is_some() {
            self.left = Some(Box::new(self.left.as_mut().unwrap().replace_node(nodes.clone())));
        }
        if self.right.is_some() {
            self.right = Some(Box::new(self.right.as_mut().unwrap().replace_node(nodes.clone())));
        }

        self.clone()
    }
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        types::{
            AddressSignatureLeaf, ECDSASignatureLeaf, ECDSASignatureType, NestedLeaf, NodeLeaf,
            Signer, SubdigestLeaf,
        },
        utils::parse_hex_to_bytes32,
    };

    #[test]
    fn test_leaf_for_address_and_weight() -> Result<()> {
        let test_addr = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse::<Address>()?;
        let test_weight = 1;
        let expected_output = parse_hex_to_bytes32(
            "0x0000000000000000000000014fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed",
        )?;

        let result = leaf_for_address_and_weight(test_addr, test_weight)?;

        assert_eq!(result, expected_output);

        Ok(())
    }

    #[test]
    fn test_leaf_for_nested() -> Result<()> {
        let test_node = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;
        let test_threshold = 1;
        let expected_output = parse_hex_to_bytes32(
            "0x907152f3fb1d245b378d4a00af6de7e68f3458fdfbeab39db0e2fb84c676e449",
        )?;

        let result = leaf_for_nested(test_node, test_threshold, 1)?;
        println!("{:?}", result);

        assert_eq!(result, expected_output);

        Ok(())
    }

    #[test]
    fn test_leaf_for_hardcoded_subdigest() -> Result<()> {
        let test_hardcoded_digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;
        let expected_output = parse_hex_to_bytes32(
            "0x1773e5bd11cd42e98b2e68005291627c91f4554148dd1a0e3941a681d892b516",
        )?;

        let result = leaf_for_hardcoded_subdigest(test_hardcoded_digest)?;

        assert_eq!(result, expected_output);

        Ok(())
    }

    #[test]
    fn test_hash_signature_leaf_address() -> Result<()> {
        let leaf = SignerNode {
            signer: Some(Signer {
                weight: Some(129),
                leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                    address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse()?,
                }),
            }),
            left: None,
            right: None,
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x00000000000000000000008107ab71fe97f9122a2dbe3797aa441623f5a59db1",
        )?;
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32])?);

        Ok(())
    }

    #[test]
    fn test_hash_signature_leaf_subdigest() -> Result<()> {
        let leaf = SignerNode {
            signer: Some(Signer {
                weight: Some(129),
                leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                    hash: parse_hex_to_bytes32(
                        "0xb38b3da0ef56c3094675167fed4a263c3346b325dddb6e56a3eb9a10ed7539ed",
                    )?
                    .into(),
                }),
            }),
            left: None,
            right: None,
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x7cf15e50f6d44f71912ca6575b7fd911a5c6f19d0195692c7d35a102ad5ae98b",
        )?;
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32])?);

        Ok(())
    }

    #[test]
    fn test_hash_signature_leaf_nested() -> Result<()> {
        let leaf = SignerNode {
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                    internal_root: [0; 32].into(),
                    internal_threshold: 211,
                    external_weight: 90,
                    size: 3,
                })
            }),
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
                left: Some(Box::new(SignerNode {
                    left: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: None,
                            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                hash: parse_hex_to_bytes32("0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed")?.into()
                            }),
                        }),
                    })),
                    right: Some(Box::new(SignerNode {
                        left: None,
                        right: None,
                        signer: Some(Signer {
                            weight: None,
                            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                hash: parse_hex_to_bytes32("0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60")?.into()
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
                            address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse()?,
                        }),
                    }),
                })),
                signer: None,
            })),
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x6cca65d12b31379a7b429e43443969524821e57d2c6a7fafae8e30bd31a5295b",
        )?;
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32])?);

        Ok(())
    }

    #[test]
    fn test_hash_signature_leaf_node() -> Result<()> {
        let leaf = SignerNode {
            signer: None,
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    weight: Some(129),
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
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )?
                        .into(),
                    }),
                }),
            })),
        };
        let expected_hex = parse_hex_to_bytes32(
            "0x47dcfac6c5622054a0ac762baa1a5eb10705484ea1e000869bbc11a093bec97e",
        )?;
        assert_eq!(expected_hex, leaf.calculate_image_hash_from_node([0; 32])?);

        Ok(())
    }

    #[test]
    fn test_get_signers() -> Result<()> {
        // Define some dummy signers
        let signer1 = Signer {
            weight: None,
            leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
        };
        let signer2 = Signer {
            weight: None,
            leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
        };
        let signer3 = Signer {
            weight: None,
            leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
        };

        // Construct the signer tree
        let tree = SignerNode {
            signer: Some(signer1.clone()),
            left: Some(Box::new(SignerNode {
                signer: Some(signer2.clone()),
                left: None,
                right: None,
            })),
            right: Some(Box::new(SignerNode {
                signer: Some(signer3.clone()),
                left: None,
                right: None,
            })),
        };

        // Test the function
        let signers = tree.get_signers();
        assert_eq!(signers.len(), 3);
        assert!(signers.contains(&signer1));
        assert!(signers.contains(&signer2));
        assert!(signers.contains(&signer3));

        Ok(())
    }

    #[test]
    fn test_replace_node() -> Result<()> {
        let mut tree = SignerNode {
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                    internal_root: [0; 32].into(),
                    internal_threshold: 211,
                    external_weight: 90,
                    size: 3,
                }),
            }),
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
            right: None,
        };

        let signer = Signer {
            weight: Some(3),
            leaf: SignatureLeaf::ECDSASignature(ECDSASignatureLeaf {
                address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse()?,
                signature_type: ECDSASignatureType::ECDSASignatureTypeEIP712,
                signature: [0u8; 65].into(),
            }),
        };
        let signer_nodes: Vec<SignerNode> =
            vec![SignerNode { left: None, right: None, signer: Some(signer.clone()) }];

        tree.replace_node(signer_nodes);
        assert_eq!(tree.left.unwrap().signer.unwrap(), signer);

        Ok(())
    }
}
