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
    abi::{encode, Token},
    types::{Address, H160},
    utils::{hex, keccak256},
};
use eyre::{eyre, Result};

pub(crate) fn read_uint8_address(data: &[u8], index: usize) -> Result<(u8, Address, usize)> {
    let new_pointer = index + 21;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[index..new_pointer];

    let (slice_1, slice_2) = slice.split_at(1);

    let a = slice_1[0];

    let h160 = H160::from_slice(slice_2);
    let b = Address::from(h160);

    Ok((a, b, new_pointer))
}

pub(crate) fn hash_keccak_256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
    keccak256(encode(&[Token::FixedBytes(a.to_vec()), Token::FixedBytes(b.to_vec())]))
}

pub(crate) fn parse_hex_to_bytes32(hex: &str) -> Result<[u8; 32]> {
    let stripped = hex.strip_prefix("0x").unwrap_or(hex);
    let vec = hex::decode(stripped)?;

    if vec.len() != 32 {
        return Err(hex::FromHexError::InvalidStringLength.into());
    }

    let mut arr = [0u8; 32];
    arr.copy_from_slice(&vec);
    Ok(arr)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_uint8_address() {
        let data = [1u8; 25];
        let index = 0usize;
        let result = read_uint8_address(&data, index);

        assert!(result.is_ok());
        let (a, _b, new_pointer) = result.unwrap();
        assert_eq!(a, 1);
        assert_eq!(new_pointer, 21);
    }

    #[test]
    fn test_hash_keccak_256() {
        let a: [u8; 32] = [1; 32];
        let b: [u8; 32] = [2; 32];
        let result = hash_keccak_256(a, b);
        assert_ne!(a, result);
    }

    #[test]
    fn test_parse_hex_to_bytes32() {
        let hex = "0x28691a6618bc54d40e2d3af7bda922140e8c3f5e8f7abc5a6462e7b4528f4000";
        let result = parse_hex_to_bytes32(hex);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 32);
    }
}
