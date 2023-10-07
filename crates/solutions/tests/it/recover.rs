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

use lightdotso_solutions::{
    hash::image_hash_of_wallet_config,
    recover::recover_signature,
    utils::{from_hex_string, parse_hex_to_bytes32},
};

pub const FIRST_SIG: &str = "0x0001000000010001783610798879fb9af654e2a99929e00e82c3a0f4288c08bc30266b64dc3e23285d634f6658fdeeb5ba9193b5e935a42a1d9bdf5007144707c9082e6eda5d8fbd1b01";
pub const FIRST_USER_OP_HASH: &str =
    "0x1A8D7C5989225F7EF86FD7844C64B74E04D361734664FA6D2BF307414327875A";
pub const FIRST_WALLET: &str = "0x10dbbe70128929723c1b982e53c51653232e4ff2";
pub const FIRST_IMAGE_HASH: &str =
    "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6";

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_module_first() {
    let sig = from_hex_string(FIRST_SIG).unwrap();
    let user_op_hash = parse_hex_to_bytes32(FIRST_USER_OP_HASH).unwrap();
    let wallet = FIRST_WALLET.parse().unwrap();
    let image_hash = FIRST_IMAGE_HASH;

    let config = recover_signature(wallet, 11155111, user_op_hash, sig).await.unwrap();
    assert_eq!(config.checkpoint, 1);
    assert_eq!(config.threshold, 1);
    assert_eq!(config.weight, 1);
    assert_eq!(image_hash_of_wallet_config(config).unwrap(), image_hash);
}
