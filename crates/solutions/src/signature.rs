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

fn recover(sig: Signature) -> Result<WalletConfig> {
    let s = sig.len();

    // If the length is lees than 2 bytes, it's an invalid signature
    if s < 2 {
        return Err(eyre!("Invalid signature"));
    }

    // Threshold is the first two bytes of the signature
    // Hex: 0x0000 ~ 0xFFFF
    // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L269C9-L269C9
    // License: Apache-2.0
    let threshold = u16::from_be_bytes([sig[0], sig[1]]);

    // If the length is less than 34 bytes, it doesn't have a checkpoint
    if s < 34 {
        return Ok(WalletConfig { checkpoint: [0; 32], threshold, signers: vec![] });
    }

    // Checkpoint is the next 32 bytes of the signature
    // Hex: 0x00000000
    // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L270C7-L270C17
    // License: Apache-2.0
    let checkpoint: [u8; 32] = sig[2..34].try_into()?;

    Ok(WalletConfig { checkpoint, threshold, signers: vec![] })
}

pub fn decode_signature(sig: Signature) -> Result<WalletConfig> {
    let s = sig.len();

    // If the length is lees than 2 bytes, it's an invalid signature
    if s < 1 {
        return Err(eyre!("Invalid signature"));
    }

    recover(sig)
}

#[cfg(test)]
mod tests {
    use super::*;
    use eyre::eyre;

    #[test]
    fn test_recover_threshold() {
        let signature: Signature = vec![0x11, 0x11];

        let res = decode_signature(signature).unwrap();
        assert!(res.threshold == 4369);
    }

    #[test]
    fn test_recover_checkpoint() {
        let signature: Signature = Iterator::collect::<Vec<u8>>([1; 34].iter().copied());

        let res = decode_signature(signature).unwrap();
        assert!(res.checkpoint == [1; 32]);
    }

    #[test]
    fn test_decode_signature_empty() {
        let signature: Signature = vec![];

        let expected_err = eyre!("Invalid signature");

        let res = decode_signature(signature).unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }
}
