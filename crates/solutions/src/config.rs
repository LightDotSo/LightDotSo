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

use crate::types::{Signer, SignerNode};
use ethers::{
    abi::{encode, Token},
    types::{H256, U256},
    utils::keccak256,
};
use eyre::Result;
use serde::{Deserialize, Serialize};

/// The struct representation of a wallet config
/// Derived from: https://github.com/0xsequence/go-sequence/blob/eabca0c348b5d87dd943a551908c80f61c347899/config.go#L12
/// License: Apache-2.0
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct WalletConfig {
    // Bytes32 hash of the checkpoint
    pub checkpoint: u32,
    // Uint16 threshold
    pub threshold: u16,
    // Uint256 weight of the retured signature
    pub weight: usize,
    // Image hash of the wallet config that is used to verify the wallet
    pub image_hash: H256,
    // Signers of the wallet
    pub tree: SignerNode,
    // Internal field used to store the image hash of the wallet config
    #[serde(skip_serializing_if = "Option::is_none")]
    pub internal_root: Option<H256>,
}

impl WalletConfig {
    // Encoding the wallet config into bytes and hash it using keccak256
    // Requires the internal_root to be set before calling this function
    // internal_root is computed by the module
    pub fn image_hash_of_wallet_config(&self) -> Result<[u8; 32]> {
        Ok(keccak256(encode(&[
            Token::FixedBytes(
                keccak256(encode(&[
                    Token::FixedBytes(self.internal_root.unwrap().0.to_vec()),
                    Token::Uint(U256::from(self.threshold)),
                ]))
                .to_vec(),
            ),
            Token::Uint(U256::from(self.checkpoint)),
        ])))
    }

    /// Get all signers in the wallet config in an array
    pub fn get_signers(&self) -> Vec<Signer> {
        self.get_signers_recursive(&self.tree)
    }

    #[allow(clippy::only_used_in_recursion)]
    fn get_signers_recursive(&self, node: &SignerNode) -> Vec<Signer> {
        let mut signers = Vec::new();

        if let Some(signer) = &node.signer {
            signers.push(signer.clone());
        }

        if let Some(left) = &node.left {
            signers.extend(self.get_signers_recursive(left));
        }

        if let Some(right) = &node.right {
            signers.extend(self.get_signers_recursive(right));
        }

        signers
    }

    pub fn is_wallet_valid(&self) -> bool {
        let total_weight: u8 = self.get_signers().iter().map(|signer| signer.weight).sum();
        total_weight >= self.threshold as u8
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        types::{
            ECDSASignatureLeaf, ECDSASignatureType, NodeLeaf, SignatureLeaf, Signer, SignerNode,
        },
        utils::parse_hex_to_bytes32,
    };

    #[test]
    fn test_image_hash_of_wallet_config() {
        let leaf = ECDSASignatureLeaf {
            address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse().unwrap(),
            signature_type: ECDSASignatureType::ECDSASignatureTypeEIP712,
            signature: [0u8; 65].into(),
        };

        // From: contracts/src/test/utils/LightWalletUtils.sol
        let wc = WalletConfig {
            checkpoint: 1,
            threshold: 1,
            weight: 1,
            image_hash: [0; 32].into(),
            tree: SignerNode {
                signer: Some(Signer { weight: 1, leaf: SignatureLeaf::ECDSASignature(leaf) }),
                left: None,
                right: None,
            },
            internal_root: Some(
                parse_hex_to_bytes32(
                    "0x0000000000000000000000016ca6d1e2d5347bfab1d91e883f1915560e09129d",
                )
                .unwrap()
                .into(),
            ),
        };

        let expected = parse_hex_to_bytes32(
            "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6",
        )
        .unwrap();
        assert_eq!(expected, wc.image_hash_of_wallet_config().unwrap());
    }

    #[test]
    fn test_get_signers() {
        // Define some dummy signers
        let signer1 = Signer { weight: 1, leaf: SignatureLeaf::NodeSignature(NodeLeaf {}) };
        let signer2 = Signer { weight: 2, leaf: SignatureLeaf::NodeSignature(NodeLeaf {}) };
        let signer3 = Signer { weight: 3, leaf: SignatureLeaf::NodeSignature(NodeLeaf {}) };

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

        // Construct the wallet config
        let config = WalletConfig {
            checkpoint: 123,
            threshold: 10,
            weight: 20,
            image_hash: [0; 32].into(),
            tree,
            internal_root: None,
        };

        // Test the function
        let signers = config.get_signers();
        assert_eq!(signers.len(), 3);
        assert!(signers.contains(&signer1));
        assert!(signers.contains(&signer2));
        assert!(signers.contains(&signer3));
    }

    #[test]
    fn test_is_wallet_valid() {
        // Define some dummy signers
        let signer1 = Signer { weight: 1, leaf: SignatureLeaf::NodeSignature(NodeLeaf {}) };
        let signer2 = Signer { weight: 2, leaf: SignatureLeaf::NodeSignature(NodeLeaf {}) };
        let signer3 = Signer { weight: 3, leaf: SignatureLeaf::NodeSignature(NodeLeaf {}) };

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

        // Construct the wallet config
        let mut config = WalletConfig {
            checkpoint: 123,
            threshold: 3,
            weight: 20,
            image_hash: [0; 32].into(),
            tree,
            internal_root: None,
        };

        // The config has valid threshold
        assert!(config.is_wallet_valid());

        // The config has invalid threshold
        config.threshold = 100;
        assert!(!config.is_wallet_valid());
    }
}
