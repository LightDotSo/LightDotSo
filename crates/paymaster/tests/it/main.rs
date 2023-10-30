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

use ethers::{
    types::{RecoveryMessage, Signature},
    utils::hash_message,
};
use lightdotso_common::traits::HexToBytes;
use std::str::FromStr;

#[test]
fn test_signer_recover() {
    let message = RecoveryMessage::Hash(hash_message(
        "0x46ef878aef00498043063eb5e8476ce803fd1e95681f1a446bf3b06b6b8a6083"
            .hex_to_bytes32()
            .unwrap(),
    ));
    let signature = Signature::from_str("0x53c0cf9a125aad3ab7c08d1b6b4a18867934e72b3800607fd9fd1755ab2c8f035345cb389cbdd64b3ffdc434d23b7a1ca02c69f6a89be68b016a1cef305a38041b").unwrap();
    let a = signature.recover(message).unwrap();
    assert_eq!(a, "0x514a099c7eC404adF25e3b6b6A3523Ac3A4A778F".parse().unwrap());
}

#[test]
fn test_signer_kms_recover() {
    let message = RecoveryMessage::Hash(hash_message(
        "0xd6eda79437abd47e04f9c19917eced2069d46c6d37dc3a25f9f709fb8c427157"
            .hex_to_bytes32()
            .unwrap(),
    ));
    let signature = Signature::from_str("0x6b9d2472bd00e3f33eedc88f411f1b774ebc78a487a55542f9e27d58cf0e4cca5105c7985e5eabaec1e3817f4f3e8bcfe51b20803cdae6eecd099f1ecbc31af837").unwrap();
    let a = signature.recover(message).unwrap();
    assert_eq!(a, "0xEEdeadba8cAC470fDCe318892a07aBE26Aa4ab17".parse().unwrap());
}
