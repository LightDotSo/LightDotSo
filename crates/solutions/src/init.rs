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

pub fn get_image_hash_salt_from_init_code(
    init_code: Vec<u8>,
) -> Result<([u8; 32], [u8; 32]), eyre::Error> {
    let mut image_hash = [0; 32];
    image_hash.copy_from_slice(&init_code[24..56]);

    let mut salt = [0; 32];
    salt.copy_from_slice(&init_code[56..88]);
    Ok((image_hash, salt))
}

#[cfg(test)]
mod tests {
    use super::*;
    use eyre::Result;
    use lightdotso_common::traits::HexToBytes;

    #[test]
    fn test_get_image_hash_salt_from_init_code() -> Result<(), eyre::Error> {
        let init_code = "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c8b7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed60000000000000000000000000000000000000000000000000000000000000001".hex_to_bytes().unwrap();

        let (image_hash, salt) = get_image_hash_salt_from_init_code(init_code)?;

        let expected_image_hash =
            "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6"
                .hex_to_bytes()
                .unwrap();
        assert_eq!(image_hash, expected_image_hash.as_slice());

        let expected_salt = "0x0000000000000000000000000000000000000000000000000000000000000001"
            .hex_to_bytes()
            .unwrap();
        assert_eq!(salt, expected_salt.as_slice());

        Ok(())
    }
}
