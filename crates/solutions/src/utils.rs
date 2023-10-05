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
    types::{Address, H160},
    utils::hex,
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
