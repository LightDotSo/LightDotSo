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
use lightdotso_signer::kms::KmsSigner;
use std::time::Duration;
use tokio::time::timeout;

#[tokio::test(flavor = "multi_thread")]
async fn test_kms_connect() {
    let _ = dotenvy::dotenv();

    let signer = timeout(
        // timeout must be << than the lock TTL to avoid a
        // bug in the redis lock implementation that panics if connection
        // takes longer than the TTL. Generally the TLL should be on the order of 10s of seconds
        // so this should give ample time for the connection to establish.
        Duration::from_millis(60000 / 10),
        KmsSigner::connect(
            1,
            rusoto_core::Region::UsEast1,
            vec![std::env::var("AWS_KMS_KEY_ID").unwrap()],
            std::env::var("REDIS_URI").unwrap(),
            60000,
        ),
    )
    .await;

    assert!(signer.is_ok(), "should connect to kms");

    let signer = signer.unwrap().unwrap().signer;

    // Print the address of the signer to stdout so that it can be used in the integration tests
    println!("Signer address: {:?}", signer.address());
}
