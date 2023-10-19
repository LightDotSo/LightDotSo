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

use crate::utils::{hex_to_bytes, hex_to_bytes32};
use ethers_main::utils::hex;
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
