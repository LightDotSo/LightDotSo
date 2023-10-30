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

use ethers::signers::Signer;
use lightdotso_signer::connect::connect_to_kms;

#[ignore]
#[tokio::test]
async fn test_kms_connect() {
    let _ = dotenvy::dotenv();

    // From: https://github.com/alchemyplatform/rundler/blob/b337dcb090c2ec26418878b3a4d3eb82f452257f/crates/builder/src/task.rs#L241
    // License: LGPL-3.0
    let signer = connect_to_kms().await.unwrap();

    // Print the address of the signer to stdout so that it can be used in the integration tests
    println!("Signer address: {:?}", signer.address());
}

#[ignore]
#[tokio::test]
async fn test_eth_sign() {
    let _ = dotenvy::dotenv();

    // From: https://github.com/alchemyplatform/rundler/blob/b337dcb090c2ec26418878b3a4d3eb82f452257f/crates/builder/src/task.rs#L241
    // License: LGPL-3.0
    let signer = connect_to_kms().await.unwrap();

    let message = "Hello, world!";
    let signature = signer.sign_message(message).await.unwrap();

    // The signature should be 65 bytes long
    assert_eq!(signature.to_vec().len(), 65);

    let address = signer.address();
    let recovered_address = signature.recover(message).unwrap();
    assert_eq!(address, recovered_address);
}
