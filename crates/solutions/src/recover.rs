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
    modules::base::BaseSigModule,
    types::{Signature, WalletConfig},
    utils::read_uint24,
};
use async_recursion::async_recursion;
use eyre::{eyre, Result};

#[async_recursion]
pub async fn recover_signature(digest: [u8; 32], sig: Signature) -> Result<WalletConfig> {
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
        let mut base_sig_module = BaseSigModule::empty();
        base_sig_module.set_signature(sig);
        base_sig_module.set_subdigest_base(digest);
        return base_sig_module.recover().await;
    }

    // Dynamic signature
    if signature_type == 0x01 {
        let mut base_sig_module = BaseSigModule::empty();
        // Set the signature after the first byte
        base_sig_module.set_signature(sig[1..].to_vec());
        base_sig_module.set_subdigest_base(digest);
        return base_sig_module.recover().await;
    }

    // No ChainId signature
    if signature_type == 0x02 {
        return recover_chained(digest, sig).await;
    }

    // ChainId signature
    if signature_type == 0x03 {
        let mut base_sig_module = BaseSigModule::empty();
        base_sig_module.set_signature(sig);
        base_sig_module.set_subdigest_no_chain_id(digest);
        return base_sig_module.recover().await;
    }

    Err(eyre!("Invalid signature type"))
}

async fn recover_chained(digest: [u8; 32], signature: Signature) -> Result<WalletConfig> {
    let rindex: usize = 1;

    let (sig_size, rindex) = read_uint24(&signature, rindex)?;

    recover_signature(digest, signature[rindex..(sig_size as usize)].to_vec()).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use eyre::eyre;

    #[tokio::test]
    async fn test_recover_signature_empty() {
        let signature: Signature = vec![];

        let expected_err = eyre!("Invalid signature length");

        let res = recover_signature([1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }

    #[tokio::test]
    async fn test_decode_invalid_signature_type() {
        let signature: Signature = vec![0x9];

        let expected_err = eyre!("Invalid signature type");

        let res = recover_signature([1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }
}
