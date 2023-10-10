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

use crate::{config::WalletConfig, module::SigModule, types::Signature, utils::read_uint24};
use async_recursion::async_recursion;
use ethers::{
    abi::{encode_packed, Token},
    types::Address,
    utils::keccak256,
};
use eyre::{eyre, Result};

#[async_recursion]
pub async fn recover_signature(
    address: Address,
    chain_id: u64,
    digest: [u8; 32],
    sig: Signature,
) -> Result<WalletConfig> {
    let s = sig.len();

    // If the length is lees than 2 bytes, it's an invalid signature
    if s < 1 {
        return Err(eyre!("Invalid signature length"));
    }

    // Signature type is the first byte of the signature
    // Hex: 0x00 ~ 0xFF
    // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/ModuleAuth.sol#L56
    // License: Apache-2.0
    let signature_type = sig.as_slice()[0];

    // Legacy signature
    if signature_type == 0x00 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest, None);
        base_sig_module.set_signature(sig);
        return base_sig_module.recover().await;
    }

    // Dynamic signature
    if signature_type == 0x01 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest, None);
        // Set the signature after the first byte
        base_sig_module.set_signature(sig.as_slice()[1..].to_vec().into());
        return base_sig_module.recover().await;
    }

    // No ChainId signature
    if signature_type == 0x02 {
        let mut base_sig_module = SigModule::new(address, 0, digest, None);
        base_sig_module.set_signature(sig.as_slice()[1..].to_vec().into());
        return base_sig_module.recover().await;
    }

    // Chained signature
    if signature_type == 0x03 {
        return recover_chained(address, chain_id, digest, sig).await;
    }

    Err(eyre!("Invalid signature type"))
}

async fn recover_chained(
    address: Address,
    chain_id: u64,
    digest: [u8; 32],
    signature: Signature,
) -> Result<WalletConfig> {
    let rindex: usize = 1;

    let (sig_size, rindex) = read_uint24(signature.as_slice(), rindex)?;
    let nrindex = rindex + (sig_size as usize);

    let initial_config = recover_signature(
        address,
        chain_id,
        digest,
        signature.as_slice()[rindex..nrindex].to_vec().into(),
    )
    .await?;

    if initial_config.weight < initial_config.threshold.into() {
        return Err(eyre!("Less than threshold"));
    }

    let mut config: Option<WalletConfig> = None;
    let mut rindex = nrindex;
    let mut checkpoint = initial_config.checkpoint;

    while rindex < signature.len() {
        let (sig_size, sig_rindex) = read_uint24(signature.as_slice(), rindex)?;
        let nrindex = sig_rindex + (sig_size as usize);

        let hashed_digest = set_image_hash(signature.as_slice()[sig_rindex..nrindex].to_vec());
        config = Some(
            recover_signature(
                address,
                chain_id,
                hashed_digest,
                signature.as_slice()[sig_rindex..nrindex].to_vec().into(),
            )
            .await?,
        );

        if config.as_ref().unwrap().weight < config.as_ref().unwrap().threshold.into() {
            return Err(eyre!("Less than threshold"));
        }

        if config.as_ref().unwrap().checkpoint >= checkpoint {
            return Err(eyre!("Invalid checkpoint"));
        }

        checkpoint = config.as_ref().unwrap().checkpoint;
        rindex = nrindex;
    }

    match &mut config {
        // If the config is Some, return the config w/ the initial image hash
        Some(config) => {
            config.image_hash = initial_config.image_hash;
            Ok(config.clone())
        }
        // If the config is None, return the initial config
        None => Ok(initial_config),
    }
}

fn set_image_hash(sig_hash: Vec<u8>) -> [u8; 32] {
    keccak256(
        encode_packed(&[
            Token::FixedBytes(keccak256("SetImageHash(bytes32 imageHash)").to_vec()),
            Token::FixedBytes(sig_hash),
        ])
        .unwrap(),
    )
}

#[cfg(test)]
mod tests {
    use crate::utils::parse_hex_to_bytes32;

    use super::*;
    use eyre::eyre;

    #[tokio::test]
    async fn test_recover_signature_empty() {
        let signature: Signature = vec![].into();

        let expected_err = eyre!("Invalid signature length");

        let res = recover_signature(Address::zero(), 1, [1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }

    #[tokio::test]
    async fn test_decode_invalid_signature_type() {
        let signature: Signature = vec![0x9].into();

        let expected_err = eyre!("Invalid signature type");

        let res = recover_signature(Address::zero(), 1, [1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }

    #[test]
    fn test_set_image_hash() {
        let digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let expected_output = parse_hex_to_bytes32(
            "0xb5e1f9d781177bfdce4895e85793155c359e351caedd1c17a5c684d110566de7",
        )
        .unwrap();

        let result = set_image_hash(digest.to_vec());

        assert_eq!(result, expected_output);
    }
}
