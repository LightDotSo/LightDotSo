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

use crate::{
    module::SigModule,
    types::{Signature, WalletConfig},
    utils::read_uint24,
};
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
    let signature_type = sig[0];

    // Legacy signature
    if signature_type == 0x00 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest);
        base_sig_module.set_signature(sig);
        return base_sig_module.recover().await;
    }

    // Dynamic signature
    if signature_type == 0x01 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest);
        // Set the signature after the first byte
        base_sig_module.set_signature(sig[1..].to_vec());
        return base_sig_module.recover().await;
    }

    // No ChainId signature
    if signature_type == 0x02 {
        return recover_chained(address, 0, digest, sig).await;
    }

    // ChainId signature
    if signature_type == 0x03 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest);
        base_sig_module.set_subdigest(digest);
        return base_sig_module.recover().await;
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

    let (sig_size, rindex) = read_uint24(&signature, rindex)?;
    let nrindex = rindex + (sig_size as usize);

    let config =
        recover_signature(address, chain_id, digest, signature[rindex..nrindex].to_vec()).await?;

    if config.weight < config.threshold.into() {
        return Err(eyre!("Less than threshold"));
    }

    let mut rindex = nrindex;
    let mut checkpoint = config.checkpoint;

    while rindex < signature.len() {
        let (sig_size, sig_rindex) = read_uint24(&signature, rindex)?;
        let nrindex = sig_rindex + (sig_size as usize);

        let new_image_hash = set_image_hash(signature[sig_rindex..nrindex].to_vec());

        let config = recover_signature(
            address,
            chain_id,
            new_image_hash,
            signature[sig_rindex..nrindex].to_vec(),
        )
        .await?;

        if config.weight < config.threshold.into() {
            return Err(eyre!("Less than threshold"));
        }

        if config.checkpoint >= checkpoint {
            return Err(eyre!("Invalid checkpoint"));
        }

        checkpoint = config.checkpoint;
        rindex = nrindex;
    }

    recover_signature(address, chain_id, digest, signature[rindex..nrindex].to_vec()).await
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
    use super::*;
    use eyre::eyre;

    #[tokio::test]
    async fn test_recover_signature_empty() {
        let signature: Signature = vec![];

        let expected_err = eyre!("Invalid signature length");

        let res = recover_signature(Address::zero(), 1, [1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }

    #[tokio::test]
    async fn test_decode_invalid_signature_type() {
        let signature: Signature = vec![0x9];

        let expected_err = eyre!("Invalid signature type");

        let res = recover_signature(Address::zero(), 1, [1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }
}
