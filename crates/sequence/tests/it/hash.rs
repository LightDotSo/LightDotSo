// Copyright 2023-2024 Light
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

use ethers::types::{Address, H256};
use eyre::Result;
use lightdotso_sequence::{
    config::WalletConfig,
    hash::get_address,
    types::{NodeLeaf, SignatureLeaf, Signer, SignerNode},
    utils::parse_hex_to_bytes32,
};

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_hash_first() -> Result<()> {
    let config = WalletConfig {
        signature_type: 0,
        checkpoint: 1,
        threshold: 1,
        weight: 1,
        image_hash: [0; 32].into(),
        internal_recovered_configs: None,
        tree: SignerNode {
            signer: Some(Signer {
                weight: None,
                leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: [0; 32].into() }),
            }),
            left: None,
            right: None,
        },
        internal_root: Some(
            parse_hex_to_bytes32(
                "0x0000000000000000000000016ca6d1e2d5347bfab1d91e883f1915560e09129d",
            )?
            .into(),
        ),
    };

    // Simulate the image hash of the wallet config.
    let image_hash = config.image_hash_of_wallet_config()?;

    // Parse the image hash to bytes.
    let image_hash_bytes: H256 = image_hash.into();

    // Parse the salt to bytes.
    let salt_bytes: H256 =
        "0x0000000000000000000000000000000000000000000000000000000000000001".parse()?;

    // Calculate the new wallet address.
    let new_wallet_address = get_address(image_hash_bytes, salt_bytes)?;

    // Check the new wallet address.
    let expected: Address = "0x10DbbE70128929723c1b982e53c51653232e4Ff2".parse()?;

    assert_eq!(expected, new_wallet_address);

    Ok(())
}
