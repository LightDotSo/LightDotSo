// Copyright 2023-2024 Light, Inc.
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

use crate::types::SignerNode;
use ethers::{
    abi::{encode, Token},
    types::{H256, U256},
    utils::keccak256,
};
use eyre::{eyre, Result};
use lightdotso_common::traits::VecU8ToHex;
use lightdotso_tracing::tracing::info;
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
    // The internal field used to store the history of the recovered wallet configs
    #[serde(skip_serializing_if = "Option::is_none")]
    pub internal_recovered_configs: Option<Vec<WalletConfig>>,
}

impl WalletConfig {
    // Encoding the wallet config into bytes and hash it using keccak256
    // Requires the internal_root to be set before calling this function
    // internal_root is computed by the module
    pub fn image_hash_of_wallet_config(&self) -> Result<[u8; 32]> {
        if let Some(internal_root) = self.internal_root {
            Ok(keccak256(encode(&[
                Token::FixedBytes(
                    keccak256(encode(&[
                        Token::FixedBytes(internal_root.0.to_vec()),
                        Token::Uint(U256::from(self.threshold)),
                    ]))
                    .to_vec(),
                ),
                Token::Uint(U256::from(self.checkpoint)),
            ])))
        }
        // If the internal root is not set, return an error
        else {
            Err(eyre!("Internal root is not set"))
        }
    }

    /// Regenerate the image hash of the wallet config from the internal tree root to the image hash
    /// setter
    pub fn regenerate_image_hash(&mut self, subdigest: [u8; 32]) -> Result<[u8; 32]> {
        self.internal_root = Some(self.tree.calculate_image_hash_from_node(subdigest)?.into());
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
        // If the signature type is 0, the signature type is not encoded
        // https://github.com/LightDotSo/LightDotSo/blob/3b0ea33499477d7f9d9f2544368bcbbe54a87ca2/contracts/modules/commons/ModuleAuth.sol#L61
        // as opposed to:
        // https://github.com/LightDotSo/LightDotSo/blob/3b0ea33499477d7f9d9f2544368bcbbe54a87ca2/contracts/modules/commons/submodules/auth/SequenceDynamicSig.sol#L29
        // where the signature type is encoded in the signature
        if self.signature_type == 0 {
            return Ok([
                self.threshold.to_be_bytes().to_vec(),
                self.checkpoint.to_be_bytes().to_vec(),
                self.tree.encode_hash_from_signers()?,
            ]
            .concat());
        }

        Ok([
            vec![self.signature_type],
            self.threshold.to_be_bytes().to_vec(),
            self.checkpoint.to_be_bytes().to_vec(),
            self.tree.encode_hash_from_signers()?,
        ]
        .concat())
    }

    /// Encode the wallet config into bytes for chained wallet configs
    /// Used for debugging purposes to check the encoding of the wallet config w/ the original
    /// signature bytes
    pub fn encode_chained_wallet(&self) -> Result<Vec<u8>> {
        // Get the encoded bytes of the wallet config
        let initial_encoded = self.encode()?;
        info!("initial_encoded: {:?}", initial_encoded.to_hex_string());

        // Get the length of the encoded bytes
        let initial_length: u32 = initial_encoded.len().try_into()?;

        // Get the encoded bytes of the `internal_recovered_configs`
        let internal_recovered_configs = self
            .internal_recovered_configs
            .as_ref()
            .map(|configs| {
                configs.iter().map(|config| config.encode()).collect::<Result<Vec<Vec<u8>>>>()
            })
            .transpose()?
            .unwrap();

        // Log the encoded bytes of the `internal_recovered_configs`
        for (i, config) in internal_recovered_configs.iter().enumerate() {
            info!("internal_recovered_configs[{}]: {:?}", i, config.to_hex_string());
        }

        // Get the length of the encoded bytes of each of the `internal_recovered_configs`
        let internal_configs_length: Result<Vec<u32>> = internal_recovered_configs
            .iter()
            .map(|config| {
                let len: Result<u32, _> =
                    usize::try_into(config.len()).map_err(|_| eyre!("Failed to convert"));
                len
            })
            .collect();

        // For each of the `internal_recovered_configs`, prepend the length of the encoded bytes
        let internal_configs: Vec<Vec<u8>> = internal_recovered_configs
            .iter()
            .zip(internal_configs_length?.iter())
            .map(|(config, len)| {
                let mut bytes = len.to_be_bytes().to_vec()[1..].to_vec();
                bytes.extend(config);
                bytes
            })
            .collect();

        Ok([
            vec![3_u8],
            initial_length.to_be_bytes().to_vec()[1..].to_vec(),
            self.signature_type.to_be_bytes().to_vec(),
            self.threshold.to_be_bytes().to_vec(),
            self.checkpoint.to_be_bytes().to_vec(),
            self.tree.encode_hash_from_signers()?,
            internal_configs.concat(),
        ]
        .concat())
    }

    /// Reduce the tree in place - changes the tree structure to reduce the number of nodes more
    /// efficiently
    pub fn reduce(&mut self) {
        self.tree = self.tree.reduce_node();
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
    fn test_image_hash_of_wallet_config() -> Result<()> {
        let leaf = ECDSASignatureLeaf {
            address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse()?,
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
                )?
                .into(),
            ),
            internal_recovered_configs: None,
        };

        let expected = parse_hex_to_bytes32(
            "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6",
        )?;
        assert_eq!(expected, wc.image_hash_of_wallet_config()?);

        Ok(())
    }

    #[test]
    fn test_is_wallet_valid() -> Result<()> {
        // Define some dummy signers
        let signer1 = Signer {
            weight: Some(1),
            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                address: "0x6FFEcCF6F31e0a469D55DEdE5651D34A6ECd9FC5".parse()?,
            }),
        };
        let signer2 = Signer {
            weight: Some(3),
            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                address: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
            }),
        };
        let signer3 = Signer {
            weight: Some(6),
            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                address: "0x2aF8DDAb77A7c90a38CF26F29763365D0028cfEf".parse()?,
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
            internal_recovered_configs: None,
        };

        // The config has valid threshold
        assert!(config.is_wallet_valid());

        // The config has invalid threshold
        config.threshold = 100;
        assert!(!config.is_wallet_valid());

        Ok(())
    }
}

// 0x030000ea000500000004020314327739c49f93a04c38623b54a4a75b49e6f646000062010001000000000001482fa2ca36fb44cf7aadeb0d5edb2058460a0e128ab8b1a25046b238077bc204536eb5fda70161b84a4c9aa90a7ea0ce2972eaebdb2237532d890b1c8d6cae251c020101b1f69536d293ee3764ce9881894a68029666a8510303000000000000000000000003c5b0a31f0bc8826cfa50ca7ff9ef8c9575b455cd04000044000299db45fa81db22da69760a8bd50cd7e05942d3cfbe2a7958964ff82ddee6ab6417694d85fba90531538345149694f75cc2706a682a8c841ea8f103b578f71aa71c02
