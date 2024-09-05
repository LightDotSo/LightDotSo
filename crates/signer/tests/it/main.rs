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

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Lesser Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

use alloy::signers::Signer;
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
    let signature = signer.sign_message(message.as_bytes()).await.unwrap();

    // The signature should be 65 bytes long
    assert_eq!(signature.as_bytes().to_vec().len(), 65);

    let address = signer.address();
    let recovered_address = signature.recover_address_from_msg(message.as_bytes()).unwrap();
    assert_eq!(address, recovered_address);
}

#[ignore]
#[tokio::test]
async fn test_kms_eth_sign_recover() {
    let _ = dotenvy::dotenv();

    let signer = connect_to_kms().await.unwrap();

    let message = "0x38ed45be3f57fcb4fe573f3692fec8de3587dbf8eb2114d8945efc819799f9cb";
    let signature = signer.sign_message(message.as_bytes()).await.unwrap();

    let address = signer.address();
    let recovered_address = signature.recover_address_from_msg(message.as_bytes()).unwrap();
    assert_eq!(address, recovered_address);
}
