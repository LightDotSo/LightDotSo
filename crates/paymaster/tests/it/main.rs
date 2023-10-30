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

use ethers::{types::Signature, utils::hash_message};
use lightdotso_common::traits::HexToBytes;
use std::str::FromStr;

#[test]
fn test_signer_recover() {
    let message = hash_message(
        "0xe346f761cfbe02196e8574dc3b84ba8790b3c2ed1797a9bd38f20d7241384043"
            .hex_to_bytes32()
            .unwrap(),
    );
    let signature = Signature::from_str("0x7aa4d7dde12ce361190637ce0f9b01a25c56e4534fcc109786711a4b4f31a25b2e466d22b611a03e4743acf3ad3fd671ab2316f8101c7923700b63e586fa954e1c").unwrap();
    let a = signature.recover(message).unwrap();
    assert_eq!(a, "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf".parse().unwrap());
}

#[test]
fn test_signer_kms_recover() {
    let message = hash_message(
        "0xac535f45fc7e30693c690e0afc584cc8db9a8bd72925e816b47aa560ee1f2919"
            .hex_to_bytes32()
            .unwrap(),
    );
    let signature = Signature::from_str("0x12223eb2d9c0e26f3d61e756fd06b0e1ef090a91ed0cca931720ed7e137f08911b44013b7efa1ec9e9659a48a506adf4c8749491eeed4290a9200b6b48d04ca571").unwrap();

    let id = signature.recovery_id().unwrap();
    println!("id: {:?}", id);

    // Overwrite the recovery id
    let signature = Signature { r: signature.r, s: signature.s, v: id.to_byte().into() };

    let recovered_address = signature.recover(message).unwrap();
    assert_eq!(recovered_address, "0xeedeadba8cac470fdce318892a07abe26aa4ab17".parse().unwrap());
}
