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
    abi::{encode, Token},
    types::U256,
    utils::keccak256,
};
use eyre::{eyre, Result};

use crate::types::WalletConfig;

pub type Signature = Vec<u8>;

fn recover_threshold_checkpoint(sig: Signature) -> Result<(u16, [u8; 32])> {
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
        return Ok((threshold, [0; 32]));
    }

    // Checkpoint is the next 32 bytes of the signature
    // Hex: 0x00000000
    // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L270C7-L270C17
    // License: Apache-2.0
    let checkpoint: [u8; 32] = sig[2..34].try_into()?;

    Ok((threshold, checkpoint))
}

fn recover(sig: Signature) -> Result<WalletConfig> {
    // Get the threshold and checkpoint from the signature
    let (threshold, checkpoint) = recover_threshold_checkpoint(sig.clone())?;

    // If the length is greater than 34 bytes, it's a branch signature
    let (_weight, digest) = recover_branch(sig)?;

    let _image_hash = keccak256(encode(&[
        Token::FixedBytes(
            keccak256(encode(&[
                Token::FixedBytes(digest.to_vec()),
                Token::Uint(U256::from(threshold)),
            ]))
            .to_vec(),
        ),
        Token::Uint(U256::from(checkpoint)),
    ]));

    Ok(WalletConfig { threshold, checkpoint, signers: vec![] })
}

fn recover_branch(sig: Signature) -> Result<(u128, [u8; 32])> {
    let s = sig.len();

    // If the length is none bytes, it's an invalid signature
    if s == 0 {
        return Err(eyre!("Invalid signature"));
    }

    // Iterating over the signature while length is greater than 0
    let mut data = sig;
    while !data.is_empty() {
        // Get the first byte of the signature
        let signature_type = data[0];

        match signature_type {
            0 => data = data[1..].to_vec(),
            _ => return Err(eyre!("Invalid signature type")),
        }
    }

    Ok((0, [0; 32]))
}

fn decode_base_signature(sig: Signature) -> Result<WalletConfig> {
    recover(sig)
}

pub fn decode_signature(sig: Signature) -> Result<WalletConfig> {
    let s = sig.len();

    // If the length is lees than 2 bytes, it's an invalid signature
    if s < 1 {
        return Err(eyre!("Invalid signature length"));
    }

    // Signature type is the first byte of the signature
    // Hex: 0x00 ~ 0xFF
    // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/ModuleAuth.sol#L56
    // License: Apache-2.0
    let signature_type = sig[0];

    // Legacy signature
    if signature_type == 0x00 {
        return decode_base_signature(sig);
    }

    // Dynamic signature
    if signature_type == 0x01 {
        return decode_base_signature(sig[1..].to_vec());
    }

    // No ChainId signature
    if signature_type == 0x02 {
        return decode_base_signature(sig[1..].to_vec());
    }

    // ChainId signature
    if signature_type == 0x03 {
        return decode_base_signature(sig[1..].to_vec());
    }

    Err(eyre!("Invalid signature type"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use eyre::eyre;

    #[test]
    fn test_recover_threshold() {
        let signature: Signature = vec![0x11, 0x11];

        let res = recover_threshold_checkpoint(signature).unwrap();
        assert!(res.0 == 4369);
    }

    #[test]
    fn test_recover_checkpoint() {
        let signature: Signature = Iterator::collect::<Vec<u8>>([1; 34].iter().copied());

        let res = recover_threshold_checkpoint(signature).unwrap();
        assert!(res.1 == [1; 32]);
    }

    #[test]
    fn test_decode_signature_empty() {
        let signature: Signature = vec![];

        let expected_err = eyre!("Invalid signature length");

        let res = decode_signature(signature).unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }

    #[test]
    fn test_decode_invalid_signature_type() {
        let signature: Signature = vec![0x9];

        let expected_err = eyre!("Invalid signature type");

        let res = decode_signature(signature).unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }
}
