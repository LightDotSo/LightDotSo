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

use ethers::types::{Address, H160, H256};
use lightdotso_solutions::{
    hash::get_address,
    types::{Signer, WalletConfig},
};

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_hash_first() {
    let address: H160 = "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse().unwrap();

    let config = WalletConfig {
        checkpoint: 1,
        threshold: 1,
        weight: 1,
        image_hash: [0; 32],
        signers: vec![Signer { weight: 1, address }],
    };

    // Simulate the image hash of the wallet config.
    let image_hash = config.image_hash_of_wallet_config().unwrap();

    // Parse the image hash to bytes.
    let image_hash_bytes: H256 = image_hash.parse().unwrap();

    // Parse the salt to bytes.
    let salt_bytes: H256 =
        "0x0000000000000000000000000000000000000000000000000000000000000001".parse().unwrap();

    // Calculate the new wallet address.
    let new_wallet_address = get_address(image_hash_bytes, salt_bytes);

    // Check the new wallet address.
    let expected: Address = "0x10DbbE70128929723c1b982e53c51653232e4Ff2".parse().unwrap();

    assert_eq!(expected, new_wallet_address);
}
