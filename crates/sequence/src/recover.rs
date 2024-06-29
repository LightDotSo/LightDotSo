// Copyright 2023-2024 Light.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![allow(clippy::unwrap_used)]

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

    // println!("signature_type: {}", signature_type);

    // Legacy signature
    if signature_type == 0x00 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest, None);
        let _ = base_sig_module.set_subdigest();
        base_sig_module.set_signature(sig);
        return base_sig_module.recover(0).await;
    }

    // Dynamic signature
    if signature_type == 0x01 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest, None);
        let _ = base_sig_module.set_subdigest();
        // Set the signature after the first byte
        base_sig_module.set_signature(sig.as_slice()[1..].to_vec().into());
        return base_sig_module.recover(1).await;
    }

    // No ChainId signature
    if signature_type == 0x02 {
        let mut base_sig_module = SigModule::new(address, chain_id, digest, None);
        let _ = base_sig_module.set_subdigest();
        base_sig_module.set_signature(sig.as_slice()[1..].to_vec().into());
        return base_sig_module.recover(2).await;
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

    // println!("sig_size: {}", sig_size);
    // println!("rindex: {}", rindex);

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

    // Set the current config to the initial config
    let mut config: Option<WalletConfig> = None;

    let mut rindex = nrindex;
    let mut checkpoint = initial_config.checkpoint;

    while rindex < signature.len() {
        let (sig_size, sig_rindex) = read_uint24(signature.as_slice(), rindex)?;
        let nrindex = sig_rindex + (sig_size as usize);

        // println!("sig_size: {}", sig_size);
        // println!("sig_rindex: {}", sig_rindex);
        // println!("nrindex: {}", nrindex);

        let hashed_digest = set_image_hash(
            config.clone().unwrap_or(initial_config.clone()).image_hash.as_bytes().to_vec(),
        )?;
        let mut new_config = Some(
            recover_signature(
                address,
                chain_id,
                hashed_digest,
                signature.as_slice()[sig_rindex..nrindex].to_vec().into(),
            )
            .await?,
        );
        // println!("hashed_digest: {:?}", hashed_digest);
        // println!("new_config: {:?}", new_config);

        if new_config.as_ref().ok_or_else(|| eyre!("config is None"))?.weight <
            new_config.as_ref().ok_or_else(|| eyre!("config is None"))?.threshold.into()
        {
            return Err(eyre!("Less than threshold"));
        }

        if new_config.as_ref().ok_or_else(|| eyre!("config is None"))?.checkpoint >= checkpoint {
            return Err(eyre!("Invalid checkpoint"));
        }

        checkpoint = new_config.as_ref().ok_or_else(|| eyre!("config is None"))?.checkpoint;
        rindex = nrindex;

        // Set the config to the new config,
        if let Some(new_config) = &mut new_config {
            if let Some(config) = &mut config {
                new_config.internal_recovered_configs =
                    config.internal_recovered_configs.clone().map(|mut v| {
                        v.push(new_config.clone());
                        v
                    });
            } else {
                new_config.internal_recovered_configs =
                    Some(vec![initial_config.clone(), new_config.clone()]);
            }
        }
        config = new_config.clone();
    }

    match &mut config {
        // If the config is Some, return the config w/ the initial image hash
        Some(config) => {
            // If the `internal_recovered_configs` is None, set it to the initial config
            if config.internal_recovered_configs.is_none() {
                config.internal_recovered_configs = Some(vec![initial_config.clone()]);
            } else {
                // If the `internal_recovered_configs` is Some, set the config to the first element
                // of the `internal_recovered_configs`

                config.checkpoint = initial_config.checkpoint;
                config.threshold = initial_config.threshold;
                config.weight = initial_config.weight;
                config.image_hash = initial_config.image_hash;
                config.tree = initial_config.tree.clone();
                config.signature_type = initial_config.signature_type;
                config.internal_root = initial_config.internal_root;

                // Drop the last element of the `internal_recovered_configs`
                config.internal_recovered_configs.as_mut().unwrap().remove(0);
            }
            Ok(config.clone())
        }
        // If the config is None, return the initial config
        None => Ok(initial_config),
    }
}

fn set_image_hash(sig_hash: Vec<u8>) -> Result<[u8; 32]> {
    Ok(keccak256(encode_packed(&[
        Token::FixedBytes(keccak256("SetImageHash(bytes32 imageHash)").to_vec()),
        Token::FixedBytes(sig_hash),
    ])?))
}

#[cfg(test)]
mod tests {
    use crate::utils::parse_hex_to_bytes32;

    use super::*;
    use eyre::eyre;

    #[tokio::test]
    async fn test_recover_signature_empty() -> Result<()> {
        let signature: Signature = vec![].into();

        let expected_err = eyre!("Invalid signature length");

        let res = recover_signature(Address::zero(), 1, [1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());

        Ok(())
    }

    #[tokio::test]
    async fn test_decode_invalid_signature_type() -> Result<()> {
        let signature: Signature = vec![0x9].into();

        let expected_err = eyre!("Invalid signature type");

        let res = recover_signature(Address::zero(), 1, [1u8; 32], signature).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());

        Ok(())
    }

    #[test]
    fn test_set_image_hash() -> Result<()> {
        let digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;
        let expected_output = parse_hex_to_bytes32(
            "0xb5e1f9d781177bfdce4895e85793155c359e351caedd1c17a5c684d110566de7",
        )?;

        let result = set_image_hash(digest.to_vec())?;

        assert_eq!(result, expected_output);

        Ok(())
    }
}
