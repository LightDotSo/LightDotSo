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

use crate::types::{ECDSASignatureType, SignatureTreeECDSASignatureLeaf, ECDSA_SIGNATURE_LENGTH};
use eyre::{eyre, Result};

pub(crate) fn recover_ecdsa_signature(
    data: &[u8],
    starting_index: usize,
) -> Result<SignatureTreeECDSASignatureLeaf> {
    let new_pointer = starting_index + ECDSA_SIGNATURE_LENGTH + 1;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[starting_index..new_pointer];

    let weight = slice[0];

    let signature_type = match slice[1] {
        1 => ECDSASignatureType::ECDSASignatureTypeEIP712,
        2 => ECDSASignatureType::ECDSASignatureTypeEthSign,
        _ => return Err(eyre!("Unexpected ECDSASignatureType value")),
    };

    let mut signature = [0; ECDSA_SIGNATURE_LENGTH];
    signature.copy_from_slice(&slice[2..]);

    Ok(SignatureTreeECDSASignatureLeaf { weight, signature_type, signature })
}
