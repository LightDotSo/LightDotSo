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
    abi::{encode, encode_packed, Token},
    types::{Address, Bytes, U256},
    utils::keccak256,
};
use eyre::Result;

#[derive(Debug)]
pub struct Signer {
    weight: u8,
    address: Address,
}

#[derive(Debug)]
pub struct WalletConfig {
    checkpoint: U256,
    threshold: U256,
    signers: Vec<Signer>,
}

// Encoding the wallet config into bytes and hash it using keccak256
pub fn image_hash_of_wallet_config(wallet_config: WalletConfig) -> Result<String> {
    let signer_bytes = wallet_config
        .signers
        .first()
        .map(|signer| {
            encode_packed(&[Token::Uint(signer.weight.into()), Token::Address(signer.address)])
                .unwrap()
        })
        .unwrap();

    // Convert the signer bytes into [u8]
    let bytes: Bytes = signer_bytes.into();

    // left pad with zeros to 32 bytes
    // From: https://github.com/gakonst/ethers-rs/blob/fa3017715a298728d9fb341933818a5d0d84c2dc/ethers-core/src/utils/mod.rs#L506
    // License: MIT
    let mut padded = [0u8; 32];
    padded[32 - bytes.0.len()..].copy_from_slice(&bytes.0);

    let threshold_bytes = keccak256(encode(&[
        Token::FixedBytes(padded.to_vec()),
        Token::Uint(wallet_config.threshold),
    ]));

    // Encode the checkpoint into bytes
    let checkpoint_bytes = keccak256(encode(&[
        Token::FixedBytes(threshold_bytes.to_vec()),
        Token::Uint(wallet_config.checkpoint),
    ]));

    Ok(format!("0x{}", ethers::utils::hex::encode(checkpoint_bytes)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_image_hash_of_wallet_config() {
        // From: contracts/src/test/utils/LightWalletUtils.sol
        let wc = WalletConfig {
            checkpoint: U256::from(1u64),
            threshold: U256::from(1u64),
            signers: vec![Signer {
                weight: 1,
                address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse().unwrap(),
            }],
        };

        let expected = "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6";
        assert_eq!(expected, image_hash_of_wallet_config(wc).unwrap());
    }
}
