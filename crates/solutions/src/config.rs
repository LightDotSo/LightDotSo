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

use crate::types::SignerNode;
use ethers::{
    abi::{encode, encode_packed, Token},
    types::{H256, U256},
    utils::keccak256,
};
use eyre::Result;
use lightdotso_common::traits::VecU8ToHex;
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
    pub weight: u32,
    // Image hash of the wallet config that is used to verify the wallet
    pub image_hash: H256,
    // Signers of the wallet
    pub tree: SignerNode,
    // The type of the recovery
    pub signature_type: u8,
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

    /// Regenerate the image hash of the wallet config from the internal tree root to the image hash
    /// setter
    pub fn regenerate_image_hash(&mut self, subdigest: [u8; 32]) -> Result<[u8; 32]> {
        self.internal_root = Some(self.tree.calculate_image_hash_from_node(subdigest).into());
        self.image_hash_of_wallet_config()
    }

    /// Check if the wallet config is valid or not by checking the threshold and the total weight of
    /// the signers
    pub fn is_wallet_valid(&self) -> bool {
        // Check if the threshold is not zero
        if self.threshold == 0 {
            return false;
        }

        // Check if the total weight of the signers is greater than or equal to the threshold
        let total_weight: u8 =
            self.tree.get_signers().iter().map(|signer| signer.weight.unwrap_or(0)).sum();
        total_weight >= self.threshold as u8
    }

    /// Encode the wallet config into bytes
    /// Used for debugging purposes to check the encoding of the wallet config w/ the original
    /// signature bytes
    pub fn encode(&self) -> Result<Vec<u8>> {
        // Print signature_type
        println!("{}", vec![self.signature_type].to_hex_string());
        println!("{}", self.threshold.to_be_bytes().to_vec().to_hex_string());
        println!("{}", self.checkpoint.to_be_bytes().to_vec().to_hex_string());

        // If the signature type is 0, the signature type is not encoded
        // https://github.com/LightDotSo/LightDotSo/blob/3b0ea33499477d7f9d9f2544368bcbbe54a87ca2/contracts/modules/commons/ModuleAuth.sol#L61
        // as opposed to:
        // https://github.com/LightDotSo/LightDotSo/blob/3b0ea33499477d7f9d9f2544368bcbbe54a87ca2/contracts/modules/commons/submodules/auth/SequenceDynamicSig.sol#L29
        // where the signature type is encoded in the signature
        if self.signature_type == 0 {
            return Ok(encode_packed(&[
                Token::FixedBytes(self.threshold.to_be_bytes().to_vec()),
                Token::FixedBytes(self.checkpoint.to_be_bytes().to_vec()),
            ])
            .unwrap());
        }

        Ok(encode_packed(&[
            Token::FixedBytes(vec![self.signature_type]),
            Token::FixedBytes(self.threshold.to_be_bytes().to_vec()),
            Token::FixedBytes(self.checkpoint.to_be_bytes().to_vec()),
            // Token::FixedBytes(self.weight.to_le_bytes().to_vec()),
            // Token::FixedBytes(self.image_hash.0.to_vec()),
            // self.tree.encode()?,
        ])
        .unwrap())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        types::{
            AddressSignatureLeaf, ECDSASignatureLeaf, ECDSASignatureType, SignatureLeaf, Signer,
            SignerNode,
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
            signature_type: 1,
            checkpoint: 1,
            threshold: 1,
            weight: 1,
            image_hash: [0; 32].into(),
            tree: SignerNode {
                signer: Some(Signer { weight: Some(1), leaf: SignatureLeaf::ECDSASignature(leaf) }),
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
    fn test_is_wallet_valid() {
        // Define some dummy signers
        let signer1 = Signer {
            weight: Some(1),
            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                address: "0x6FFEcCF6F31e0a469D55DEdE5651D34A6ECd9FC5".parse().unwrap(),
            }),
        };
        let signer2 = Signer {
            weight: Some(3),
            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                address: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse().unwrap(),
            }),
        };
        let signer3 = Signer {
            weight: Some(6),
            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                address: "0x2aF8DDAb77A7c90a38CF26F29763365D0028cfEf".parse().unwrap(),
            }),
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
            signature_type: 0,
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
