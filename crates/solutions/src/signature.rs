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

use crate::types::{
    DynamicSignatureType, ECDSASignatureType, SignatureTreeDynamicSignatureLeaf,
    SignatureTreeECDSASignatureLeaf, ECDSA_SIGNATURE_LENGTH,
};
use ethers::types::Address;
use eyre::{eyre, Result};

pub(crate) fn recover_ecdsa_signature(
    data: &[u8],
    starting_index: usize,
) -> Result<SignatureTreeECDSASignatureLeaf> {
    // Add 1 for the weight, 1 for the signature type
    let new_pointer = starting_index + ECDSA_SIGNATURE_LENGTH + 1;

    // Check that the data is long enough to contain the signature
    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[starting_index..new_pointer];

    // The last byte is the signature type
    let signature_type = match slice[new_pointer - 1] {
        1 => ECDSASignatureType::ECDSASignatureTypeEIP712,
        2 => ECDSASignatureType::ECDSASignatureTypeEthSign,
        _ => return Err(eyre!("Unexpected ECDSASignatureType value")),
    };

    // The length is shorter because the signature type is omitted
    let mut signature = [0; ECDSA_SIGNATURE_LENGTH];
    signature.copy_from_slice(&slice[1..ECDSA_SIGNATURE_LENGTH + 1]);

    // Recover the address from the signature
    let address = Address::zero();

    Ok(SignatureTreeECDSASignatureLeaf { address, signature_type, signature })
}

pub(crate) fn recover_dynamic_signature(
    data: &[u8],
    starting_index: usize,
    end_index: usize,
) -> Result<SignatureTreeDynamicSignatureLeaf> {
    // Check that the data is long enough to contain the signature
    if data.len() < end_index {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[starting_index..end_index];

    // The last byte is the signature type
    let signature_type = match slice[end_index - 1] {
        1 => DynamicSignatureType::DynamicSignatureTypeEIP712,
        2 => DynamicSignatureType::DynamicSignatureTypeEthSign,
        _ => return Err(eyre!("Unexpected DynamicSignatureType value")),
    };

    // The length is the remaining length of the slice
    let signature = slice[1..].to_vec();

    // Recover the address from the signature
    let address = Address::zero();

    Ok(SignatureTreeDynamicSignatureLeaf { address, signature_type, signature })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recover_ecdsa_signature() {
        let test_data: [u8; 65] = [
            // The rest is the signature data
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
            24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
            46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,
            2, // ECDSASignatureType::ECDSASignatureTypeEthSign
        ];

        let result = recover_ecdsa_signature(&test_data, 0).unwrap();

        assert_eq!(result.signature_type, ECDSASignatureType::ECDSASignatureTypeEthSign);
        assert_eq!(result.signature[0], 0);
        assert_eq!(result.signature[63], 63);
    }
}
