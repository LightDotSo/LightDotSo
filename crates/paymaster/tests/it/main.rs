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

use ethers::types::{RecoveryMessage, Signature};
use lightdotso_common::traits::HexToBytes;
use std::str::FromStr;

#[ignore]
#[test]
fn test_signer_recover() {
    let message = RecoveryMessage::Hash(
        "0x830ad7467d3fea7824f02db7fe338f35f8b23d60712d22bba5525fc77182bfec"
            .hex_to_bytes32()
            .unwrap()
            .into(),
    );
    let signature = Signature::from_str("0x500a0a75ac258e1e121adf66b5d5b48d0b93cb3e85e1b10a01d6d8877a8387872dc69bd1db538f455b0ea65368f1b39758fd1e002ac70c2aadb24490a05f84b926").unwrap();
    let a = signature.recover(message).unwrap();
    assert_eq!(a, "0x0618fe3a19a4980a0202adbdb5201e74cd9908ff".parse().unwrap());
}
