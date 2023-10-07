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

use crate::types::{Signer, SignerNode, WalletConfig};
use ethers::{
    abi::{encode, Token},
    types::U256,
    utils::keccak256,
};
use eyre::Result;

impl WalletConfig {
    // Encoding the wallet config into bytes and hash it using keccak256
    pub fn image_hash_of_wallet_config(&self) -> Result<String> {
        let threshold_bytes = keccak256(encode(&[
            Token::FixedBytes(self.internal_root.unwrap().to_vec()),
            Token::Uint(U256::from(self.threshold)),
        ]));

        // Encode the checkpoint into bytes
        let checkpoint_bytes = keccak256(encode(&[
            Token::FixedBytes(threshold_bytes.to_vec()),
            Token::Uint(U256::from(self.checkpoint)),
        ]));

        Ok(format!("0x{}", ethers::utils::hex::encode(checkpoint_bytes)))
    }

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
    use crate::{
        types::{SignatureLeafType, Signer, SignerNode, WalletConfig},
        utils::parse_hex_to_bytes32,
    };
    use ethers::types::Address;

    #[test]
    fn test_image_hash_of_wallet_config() {
        // From: contracts/src/test/utils/LightWalletUtils.sol
        let wc = WalletConfig {
            checkpoint: 1,
            threshold: 1,
            weight: 1,
            image_hash: [0; 31]
                .iter()
                .chain(&[1])
                .copied()
                .collect::<Vec<u8>>()
                .try_into()
                .unwrap(),
            tree: SignerNode {
                signer: Some(Signer {
                    address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse().unwrap(),
                    weight: 1,
                    leaf_type: SignatureLeafType::SignatureLeafTypeAddress,
                }),
                left: None,
                right: None,
            },
            internal_root: Some(
                parse_hex_to_bytes32(
                    "0x0000000000000000000000016ca6d1e2d5347bfab1d91e883f1915560e09129d",
                )
                .unwrap(),
            ),
        };

        let expected = "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6";
        assert_eq!(expected, wc.image_hash_of_wallet_config().unwrap());
    }

    #[test]
    fn test_get_signers() {
        // Define some dummy signers
        let signer1 = Signer {
            weight: 1,
            address: Address::zero(),
            leaf_type: SignatureLeafType::SignatureLeafTypeECDSASignature,
        };
        let signer2 = Signer {
            weight: 2,
            address: Address::zero(),
            leaf_type: SignatureLeafType::SignatureLeafTypeECDSASignature,
        };
        let signer3 = Signer {
            weight: 3,
            address: Address::zero(),
            leaf_type: SignatureLeafType::SignatureLeafTypeECDSASignature,
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

        // Construct the wallet config
        let config = WalletConfig {
            checkpoint: 123,
            threshold: 10,
            weight: 20,
            image_hash: [0u8; 32],
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
        let signer1 = Signer {
            weight: 1,
            address: Address::zero(),
            leaf_type: SignatureLeafType::SignatureLeafTypeECDSASignature,
        };
        let signer2 = Signer {
            weight: 2,
            address: Address::zero(),
            leaf_type: SignatureLeafType::SignatureLeafTypeECDSASignature,
        };
        let signer3 = Signer {
            weight: 3,
            address: Address::zero(),
            leaf_type: SignatureLeafType::SignatureLeafTypeECDSASignature,
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

        // Construct the wallet config
        let mut config = WalletConfig {
            checkpoint: 123,
            threshold: 3,
            weight: 20,
            image_hash: [0u8; 32],
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
