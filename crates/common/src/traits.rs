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

use crate::utils::{hex_to_bytes, hex_to_bytes32};
use const_hex::hex;
use eyre::Result;

pub trait VecU8ToHex {
    fn to_hex_string(&self) -> String;
}

#[allow(clippy::format_collect)]
impl VecU8ToHex for Vec<u8> {
    fn to_hex_string(&self) -> String {
        let hex: String = self.iter().map(|byte| format!("{:02x}", byte)).collect();
        format!("0x{}", hex)
    }
}

pub trait HexToBytes {
    fn hex_to_bytes(&self) -> Result<Vec<u8>, hex::FromHexError>;

    fn hex_to_bytes32(&self) -> Result<[u8; 32]>;
}

impl HexToBytes for str {
    fn hex_to_bytes(&self) -> Result<Vec<u8>, hex::FromHexError> {
        // call the function directly
        hex_to_bytes(self)
    }

    fn hex_to_bytes32(&self) -> Result<[u8; 32]> {
        // call the function directly
        hex_to_bytes32(self)
    }
}

pub trait IsZero {
    fn is_zero(&self) -> bool;
}

impl IsZero for [u8; 32] {
    fn is_zero(&self) -> bool {
        self.iter().all(|&byte| byte == 0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_hex_string() {
        let bytes: Vec<u8> = vec![0, 255, 128, 64];
        assert_eq!(bytes.to_hex_string(), "0x00ff8040");
    }

    #[test]
    fn test_valid_hex() {
        let hex_str = "0x4a5b";
        let bytes = hex_str.hex_to_bytes().unwrap();
        assert_eq!(bytes, vec![74, 91]);
    }

    #[test]
    fn test_invalid_hex() {
        let hex_str = "0x4g";
        let result = hex_str.hex_to_bytes();
        assert!(result.is_err());
    }

    #[test]
    fn test_no_0x_prefix() {
        let hex_str = "4a5b";
        let result = hex_str.hex_to_bytes();
        assert!(result.is_err());
    }
}
