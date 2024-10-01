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

use eyre::Result;

pub fn get_image_hash_salt_from_init_code(init_code: Vec<u8>) -> Result<([u8; 32], [u8; 32])> {
    let mut image_hash = [0; 32];
    image_hash.copy_from_slice(&init_code[24..56]);

    let mut salt = [0; 32];
    salt.copy_from_slice(&init_code[56..88]);
    Ok((image_hash, salt))
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use lightdotso_common::traits::HexToBytes;

    #[test]
    fn test_get_image_hash_salt_from_init_code() -> Result<()> {
        let init_code = "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c8b7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed60000000000000000000000000000000000000000000000000000000000000001".hex_to_bytes()?;

        let (image_hash, salt) = get_image_hash_salt_from_init_code(init_code)?;

        let expected_image_hash =
            "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6".hex_to_bytes()?;
        assert_eq!(image_hash, expected_image_hash.as_slice());

        let expected_salt =
            "0x0000000000000000000000000000000000000000000000000000000000000001".hex_to_bytes()?;
        assert_eq!(salt, expected_salt.as_slice());

        Ok(())
    }
}
