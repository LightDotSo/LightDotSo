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

use crate::{signature::Signature, types::WalletConfig};
use ethers::{
    abi::{encode, Token},
    types::{Address, U256},
    utils::keccak256,
};
use eyre::{eyre, Result};

pub(crate) struct BaseSigModule;

impl BaseSigModule {
    fn leaf_for_address_and_weight(&self, addr: Address, weight: u128) -> [u8; 32] {
        let weight_shifted = U256::from(weight) << 160;
        let addr_u256 = U256::from_big_endian(addr.as_bytes());
        (weight_shifted | addr_u256).into()
    }

    fn recover_branch(&self, sig: Signature) -> Result<(u16, [u8; 32])> {
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

    fn recover_threshold_checkpoint(&self, sig: Signature) -> Result<(u16, [u8; 32])> {
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

    pub(crate) fn recover(self, sig: Signature) -> Result<WalletConfig> {
        // Get the threshold and checkpoint from the signature
        let (threshold, checkpoint) = self.recover_threshold_checkpoint(sig.clone())?;

        // If the length is greater than 34 bytes, it's a branch signature
        let (weight, digest) = self.recover_branch(sig)?;

        let image_hash = keccak256(encode(&[
            Token::FixedBytes(
                keccak256(encode(&[
                    Token::FixedBytes(digest.to_vec()),
                    Token::Uint(U256::from(threshold)),
                ]))
                .to_vec(),
            ),
            Token::Uint(U256::from(checkpoint)),
        ]));

        Ok(WalletConfig { threshold, checkpoint, image_hash, weight, signers: vec![] })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::utils::parse_hex_to_bytes32;
    use ethers::core::types::Address;

    #[test]
    fn test_leaf_for_address_and_weight() {
        let base_sig_module = BaseSigModule {};
        let test_addr = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse::<Address>().unwrap();
        let test_weight = 1u128;
        let expected_output = parse_hex_to_bytes32(
            "0x0000000000000000000000014fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed",
        )
        .unwrap();

        let result = base_sig_module.leaf_for_address_and_weight(test_addr, test_weight);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_base_recover_threshold() {
        let base_sig_module = BaseSigModule {};
        let signature: Signature = vec![0x11, 0x11];

        let res = base_sig_module.recover_threshold_checkpoint(signature).unwrap();
        assert!(res.0 == 4369);
    }

    #[test]
    fn test_base_recover_checkpoint() {
        let base_sig_module = BaseSigModule {};
        let signature: Signature = Iterator::collect::<Vec<u8>>([1; 34].iter().copied());

        let res = base_sig_module.recover_threshold_checkpoint(signature).unwrap();
        assert!(res.1 == [1; 32]);
    }
}
