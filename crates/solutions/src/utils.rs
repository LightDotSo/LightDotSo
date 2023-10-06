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

pub(crate) fn read_uint8(data: &[u8], index: usize) -> Result<(u8, usize)> {
    let new_pointer = index + 1;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let a = data[index];

    Ok((a, new_pointer))
}

pub(crate) fn read_uint16(data: &[u8], index: usize) -> Result<(u16, usize)> {
    let new_pointer = index + 2;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[index..new_pointer];

    let a = u16::from_be_bytes([slice[0], slice[1]]);

    Ok((a, new_pointer))
}

pub(crate) fn read_uint24(data: &[u8], index: usize) -> Result<(u32, usize), eyre::Error> {
    let new_pointer = index + 3;

    if data.len() < new_pointer {
        return Err(eyre::eyre!("index out of bounds of the input data"));
    }

    let slice = &data[index..new_pointer];
    let mut array = [0; 4];
    array[1..4].copy_from_slice(slice);
    let a = u32::from_be_bytes(array);

    Ok((a, new_pointer))
}

pub(crate) fn read_bytes32(data: &[u8], index: usize) -> Result<([u8; 32], usize), eyre::Error> {
    let new_pointer = index + 32;

    if data.len() < new_pointer {
        return Err(eyre::eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[index..new_pointer];
    let mut bytes32 = [0u8; 32];
    bytes32.copy_from_slice(slice);

    Ok((bytes32, new_pointer))
}

pub(crate) fn hash_keccak_256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
    keccak256(encode(&[Token::FixedBytes(a.to_vec()), Token::FixedBytes(b.to_vec())]))
}

pub fn from_hex_string(data: &str) -> Result<Vec<u8>> {
    let prefixed: &str =
        if data.starts_with("0x") || data.starts_with("0X") { &data[2..] } else { data };

    Ok(hex::decode(prefixed)?)
}

pub fn parse_hex_to_bytes32(hex: &str) -> Result<[u8; 32]> {
    let stripped = hex.strip_prefix("0x").unwrap_or(hex);
    let vec = hex::decode(stripped)?;

    if vec.len() != 32 {
        return Err(hex::FromHexError::InvalidStringLength.into());
    }

    let mut arr = [0u8; 32];
    arr.copy_from_slice(&vec);
    Ok(arr)
}

pub(crate) fn left_pad_to_bytes32(input: &'_ [u8]) -> [u8; 32] {
    let mut output = [0; 32];
    output[32 - input.len()..].copy_from_slice(input);
    output
}

// pub(crate) fn left_pad_u8_to_bytes32(input: u8) -> [u8; 32] {
//     left_pad_to_bytes32(&input.to_be_bytes())
// }

pub(crate) fn left_pad_u16_to_bytes32(input: u16) -> [u8; 32] {
    left_pad_to_bytes32(&input.to_be_bytes())
}

pub(crate) fn left_pad_u64_to_bytes32(input: u64) -> [u8; 32] {
    left_pad_to_bytes32(&input.to_be_bytes())
}

pub fn to_hex_string(data: &[u8]) -> String {
    format!("0x{}", hex::encode(data))
}

pub fn print_hex_string(data: &[u8]) {
    println!("{}", to_hex_string(data));
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
    fn test_read_uint16() {
        let data: [u8; 4] = [0x01, 0x02, 0xab, 0xcd];
        let index: usize = 0;
        let result = read_uint16(&data, index);

        assert!(result.is_ok());
        let (value, new_pointer) = result.unwrap();

        assert_eq!(value, 0x0102);
        assert_eq!(new_pointer, 2);
    }

    #[test]
    fn test_read_uint24() {
        let data: [u8; 5] = [0x01, 0xab, 0xcd, 0xef, 0x23];
        let index: usize = 0;
        let result = read_uint24(&data, index);

        assert!(result.is_ok());
        let (value, new_pointer) = result.unwrap();

        assert_eq!(value, 0x01abcd);
        assert_eq!(new_pointer, 3);
    }

    #[test]
    fn test_read_bytes32() {
        let data: [u8; 40] = [
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
            0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c,
            0x1d, 0x1e, 0x1f, 0x20, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89,
        ];
        let index: usize = 0;
        let result = read_bytes32(&data, index);

        assert!(result.is_ok());
        let (value, new_pointer) = result.unwrap();

        let expected: [u8; 32] = [
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
            0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c,
            0x1d, 0x1e, 0x1f, 0x20,
        ];

        assert_eq!(value, expected);
        assert_eq!(new_pointer, 32);
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
