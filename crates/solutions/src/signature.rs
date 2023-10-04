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

use eyre::{eyre, Result};

use crate::types::WalletConfig;

pub type Signature = Vec<u8>;

pub fn decode_signature(sig: Signature) -> Result<WalletConfig> {
    let s = sig.len();

    // If the length is lees than 1, it's an invalid signature
    if s < 1 {
        return Err(eyre!("Invalid signature"));
    }

    // Threshold is the first two bytes of the signature
    // Hex: 0x0000 ~ 0xFFFF
    let threshold = u16::from_be_bytes([sig[0], sig[1]]);

    Ok(WalletConfig { checkpoint: 1.into(), threshold, signers: vec![] })
}

#[cfg(test)]
mod tests {
    use super::*;
    use eyre::eyre;

    #[test]
    fn test_decode_threshold() {
        let signature: Signature = vec![0x11, 0x11];

        let res = decode_signature(signature).unwrap();
        assert!(res.threshold == 4369);
    }

    #[test]
    fn test_decode_signature_empty() {
        let signature: Signature = vec![];

        let expected_err = eyre!("Invalid signature");

        let res = decode_signature(signature).unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }
}
