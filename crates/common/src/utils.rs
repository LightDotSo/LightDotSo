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

use alloy::hex;
use eyre::{eyre, Result};

pub fn hex_to_bytes(hex_str: &str) -> Result<Vec<u8>, hex::FromHexError> {
    // Check if the hex string has the 0x prefix
    if !hex_str.starts_with("0x") {
        return Err(hex::FromHexError::InvalidStringLength);
    }

    // Remove the 0x prefix
    let pure_hex = &hex_str[2..];
    hex::decode(pure_hex) // Decode hex string to Vec<u8>
}

pub fn hex_to_bytes32(hex_str: &str) -> Result<[u8; 32]> {
    if !hex_str.starts_with("0x") {
        return Err(eyre!("Invalid hex string: no 0x prefix"));
    }

    let vec = hex_to_bytes(hex_str)?;

    if vec.len() != 32 {
        return Err(eyre!("Length mismatch: Vec is not 32 bytes long"));
    }

    let mut array = [0u8; 32];
    array.copy_from_slice(&vec);
    Ok(array)
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_hex() {
        let hex_str = "0x4a5b";
        let bytes = hex_to_bytes(hex_str).unwrap();
        assert_eq!(bytes, vec![74, 91]);
    }

    #[test]
    fn test_invalid_hex() {
        let hex_str = "0x4g";
        let result = hex_to_bytes(hex_str);
        assert!(result.is_err());
    }

    #[test]
    fn test_no_0x_prefix() {
        let hex_str = "4a5b";
        let result = hex_to_bytes(hex_str);
        assert!(result.is_err());
    }
}
