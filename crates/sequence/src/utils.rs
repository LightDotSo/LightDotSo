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

use alloy::{
    dyn_abi::DynSolValue,
    hex,
    primitives::{keccak256, Address, FixedBytes},
};
use eyre::{eyre, Result};

pub fn hash_message_bytes32(msg: &[u8; 32]) -> Result<[u8; 32]> {
    Ok(*keccak256(
        DynSolValue::Tuple(vec![
            DynSolValue::String("\x19Ethereum Signed Message:\n32".to_string()),
            DynSolValue::FixedBytes(FixedBytes::from(*msg), msg.len()),
        ])
        .abi_encode_packed(),
    ))
}

pub fn hash_image_bytes32(msg: &[u8; 32]) -> Result<[u8; 32]> {
    Ok(*keccak256(
        DynSolValue::Tuple(vec![
            DynSolValue::FixedBytes(
                FixedBytes::from(parse_hex_to_bytes32(
                    // Hash of `SetImageHash(bytes32 imageHash)`
                    "0x8713a7c4465f6fbee2b6e9d6646d1d9f83fec929edfc4baf661f3c865bdd04d1",
                )?),
                32,
            ),
            DynSolValue::FixedBytes(FixedBytes::from(*msg), msg.len()),
        ])
        .abi_encode_packed(),
    ))
}

pub fn render_subdigest(chain_id: u64, address: Address, digest: [u8; 32]) -> Result<[u8; 32]> {
    Ok(*keccak256(
        DynSolValue::Tuple(vec![
            DynSolValue::String("\x19\x01".to_string()),
            DynSolValue::FixedBytes(FixedBytes::from(left_pad_u64_to_bytes32(chain_id)), 32),
            DynSolValue::Address(address),
            DynSolValue::FixedBytes(FixedBytes::from(digest), 32),
        ])
        .abi_encode_packed(),
    ))
}

pub(crate) fn read_uint8_address(data: &[u8], index: usize) -> Result<(u8, Address, usize)> {
    let new_pointer = index + 21;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the `read_uint8_address` input data"));
    }

    let slice = &data[index..new_pointer];

    let (slice_1, slice_2) = slice.split_at(1);

    let a = slice_1[0];

    let h160 = Address::from_slice(slice_2);
    let b = Address::from(h160);

    Ok((a, b, new_pointer))
}

pub(crate) fn read_uint8(data: &[u8], index: usize) -> Result<(u8, usize)> {
    let new_pointer = index + 1;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the `read_uint8` input data"));
    }

    let a = data[index];

    Ok((a, new_pointer))
}

pub(crate) fn read_uint16(data: &[u8], index: usize) -> Result<(u16, usize)> {
    let new_pointer = index + 2;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the `read_uint16` input data"));
    }

    let slice = &data[index..new_pointer];

    let a = u16::from_be_bytes([slice[0], slice[1]]);

    Ok((a, new_pointer))
}

pub(crate) fn read_uint24(data: &[u8], index: usize) -> Result<(u32, usize), eyre::Error> {
    let new_pointer = index + 3;

    if data.len() < new_pointer {
        return Err(eyre!("index out of bounds of the `read_uint24` input data"));
    }

    let slice = &data[index..new_pointer];
    let mut array = [0; 4];
    array[1..4].copy_from_slice(slice);
    let a = u32::from_be_bytes(array);

    Ok((a, new_pointer))
}

pub(crate) fn read_uint32(data: &[u8], index: usize) -> Result<(u32, usize), eyre::Error> {
    let new_pointer = index + 4;

    if data.len() < new_pointer {
        return Err(eyre!("index out of bounds of the `read_uint32` input data"));
    }

    let slice = &data[index..new_pointer];

    let a = u32::from_be_bytes([slice[0], slice[1], slice[2], slice[3]]);

    Ok((a, new_pointer))
}

pub(crate) fn read_bytes32(data: &[u8], index: usize) -> Result<([u8; 32], usize), eyre::Error> {
    let new_pointer = index + 32;

    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the `read_bytes32` input data"));
    }

    let slice = &data[index..new_pointer];
    let mut bytes32 = [0u8; 32];
    bytes32.copy_from_slice(slice);

    Ok((bytes32, new_pointer))
}

pub(crate) fn hash_keccak_256(a: [u8; 32], b: [u8; 32]) -> [u8; 32] {
    *keccak256(
        DynSolValue::Tuple(vec![
            DynSolValue::FixedBytes(FixedBytes::from(a), 32),
            DynSolValue::FixedBytes(FixedBytes::from(b), 32),
        ])
        .abi_encode_packed(),
    )
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

pub(crate) fn right_pad_to_bytes32(input: &'_ [u8]) -> [u8; 32] {
    let mut output = [0; 32];
    output[..input.len()].copy_from_slice(input);
    output
}

pub(crate) fn left_pad_to_bytes32(input: &'_ [u8]) -> [u8; 32] {
    let mut output = [0; 32];
    output[32 - input.len()..].copy_from_slice(input);
    output
}

pub(crate) fn left_pad_u8_to_bytes32(input: u8) -> [u8; 32] {
    left_pad_to_bytes32(&input.to_be_bytes())
}

pub(crate) fn left_pad_u16_to_bytes32(input: u16) -> [u8; 32] {
    left_pad_to_bytes32(&input.to_be_bytes())
}

pub(crate) fn left_pad_u32_to_bytes32(input: u32) -> [u8; 32] {
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
    use alloy::primitives::eip191_hash_message;

    #[test]
    fn test_hash_message() -> Result<()> {
        let message = parse_hex_to_bytes32(
            "0x84fcef6a64ccef82e5436d5281e94687e0371478798a1ce226da0b9838113ce8",
        )?;
        let result_original = hash_message_bytes32(&message)?;
        let result: [u8; 32] = eip191_hash_message(message).into();
        let expected = parse_hex_to_bytes32(
            "0xdafe5b72d714f0405b7b2c2c04bf346d94964b3fd39265cc05db27f6910dbb60",
        )?;
        assert_eq!(result, result_original);
        assert_eq!(result, expected);

        Ok(())
    }

    #[test]
    fn test_render_subdigest() -> Result<()> {
        let digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;

        let res =
            render_subdigest(1, "0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f".parse()?, digest)?;

        let expected = parse_hex_to_bytes32(
            "0x349298d2e05ff7da41925abdea9f3453feada8ea0b96bac074d14609ce004ded",
        )?;

        assert_eq!(res, expected);

        Ok(())
    }

    #[test]
    fn test_read_uint8_address() -> Result<()> {
        let data = [1u8; 25];
        let index = 0usize;
        let result = read_uint8_address(&data, index);

        assert!(result.is_ok());
        let (a, _b, new_pointer) = result?;
        assert_eq!(a, 1);
        assert_eq!(new_pointer, 21);

        Ok(())
    }

    #[test]
    fn test_read_uint16() -> Result<()> {
        let data: [u8; 4] = [0x01, 0x02, 0xab, 0xcd];
        let index: usize = 0;
        let result = read_uint16(&data, index);

        assert!(result.is_ok());
        let (value, new_pointer) = result?;

        assert_eq!(value, 0x0102);
        assert_eq!(new_pointer, 2);

        Ok(())
    }

    #[test]
    fn test_read_uint24() -> Result<()> {
        let data: [u8; 5] = [0x01, 0xab, 0xcd, 0xef, 0x23];
        let index: usize = 0;
        let result = read_uint24(&data, index);

        assert!(result.is_ok());
        let (value, new_pointer) = result?;

        assert_eq!(value, 0x01abcd);
        assert_eq!(new_pointer, 3);

        Ok(())
    }

    #[test]
    fn test_read_uint32() -> Result<()> {
        let data: [u8; 5] = [0x01, 0xab, 0xcd, 0xef, 0x23];
        let index: usize = 0;
        let result = read_uint32(&data, index);

        assert!(result.is_ok());
        let (value, new_pointer) = result?;

        assert_eq!(value, 0x01abcdef);
        assert_eq!(new_pointer, 4);

        Ok(())
    }

    #[test]
    fn test_read_bytes32() -> Result<()> {
        let data: [u8; 40] = [
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
            0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c,
            0x1d, 0x1e, 0x1f, 0x20, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89,
        ];
        let index: usize = 0;
        let result = read_bytes32(&data, index);

        assert!(result.is_ok());
        let (value, new_pointer) = result?;

        let expected: [u8; 32] = [
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
            0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c,
            0x1d, 0x1e, 0x1f, 0x20,
        ];

        assert_eq!(value, expected);
        assert_eq!(new_pointer, 32);

        Ok(())
    }

    #[test]
    fn test_hash_keccak_256() -> Result<()> {
        let a: [u8; 32] = [1; 32];
        let b: [u8; 32] = [2; 32];
        let result = hash_keccak_256(a, b);
        assert_ne!(a, result);

        Ok(())
    }

    #[test]
    fn test_parse_hex_to_bytes32() -> Result<()> {
        let hex = "0x28691a6618bc54d40e2d3af7bda922140e8c3f5e8f7abc5a6462e7b4528f4000";
        let result = parse_hex_to_bytes32(hex)?;
        assert_eq!(result.len(), 32);

        Ok(())
    }
}
