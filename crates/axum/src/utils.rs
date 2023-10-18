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

use ethers_main::utils::hex;

pub fn hex_to_bytes(hex_str: &str) -> Result<Vec<u8>, hex::FromHexError> {
    // Remove the 0x prefix
    let pure_hex = &hex_str[2..];
    hex::decode(pure_hex) // Decode hex string to Vec<u8>
}

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
