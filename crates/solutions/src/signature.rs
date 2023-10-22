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

use crate::types::{
    DynamicSignatureLeaf, DynamicSignatureType, ECDSASignatureLeaf, ECDSASignatureType, Signature,
    ECDSA_SIGNATURE_LENGTH, ERC1271_MAGICVALUE_BYTES32,
};
use ethers::{
    types::{Address, RecoveryMessage, Signature as EthersSignature, H256},
    utils::hash_message,
};
use eyre::{eyre, Result};
use lightdotso_contracts::erc1271::get_erc_1271_wallet;
use lightdotso_tracing::tracing::info;
use std::str::FromStr;

pub fn recover_ecdsa_signature(
    data: &[u8],
    subdigest: &[u8; 32],
    starting_index: usize,
) -> Result<ECDSASignatureLeaf> {
    // Add 1 for the signature type
    let new_pointer = starting_index + ECDSA_SIGNATURE_LENGTH + 1;

    // Check that the data is long enough to contain the signature
    if data.len() < new_pointer {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[starting_index..new_pointer];

    // The last byte is the signature type
    let signature_type = match slice[ECDSA_SIGNATURE_LENGTH] {
        1 => ECDSASignatureType::ECDSASignatureTypeEIP712,
        2 => ECDSASignatureType::ECDSASignatureTypeEthSign,
        _ => return Err(eyre!("Unexpected ECDSASignatureType value")),
    };

    // The length is shorter because the signature type is omitted
    let mut signature_slice = [0; ECDSA_SIGNATURE_LENGTH];
    signature_slice.copy_from_slice(&slice[..ECDSA_SIGNATURE_LENGTH]);

    let signature: EthersSignature =
        EthersSignature::from_str(&ethers::utils::hex::encode(signature_slice)).unwrap();

    // Recover the address from the signature
    let address = match signature_type {
        ECDSASignatureType::ECDSASignatureTypeEIP712 => {
            let message = RecoveryMessage::Hash(H256::from(subdigest));
            signature.recover(message)?
        }
        ECDSASignatureType::ECDSASignatureTypeEthSign => {
            let message = RecoveryMessage::Hash(hash_message(H256::from(subdigest)));
            signature.recover(message)?
        }
    };

    Ok(ECDSASignatureLeaf { address, signature_type, signature: signature_slice.into() })
}

pub async fn recover_dynamic_signature(
    chain_id: u64,
    data: &[u8],
    subdigest: &[u8; 32],
    address: Address,
    starting_index: usize,
    end_index: usize,
) -> Result<DynamicSignatureLeaf> {
    // Check that the data is long enough to contain the signature
    if data.len() < end_index {
        return Err(eyre!("index is out of bounds of the input data"));
    }

    let slice = &data[starting_index..end_index];

    // The last byte is the signature type
    let signature_type = match slice[slice.len() - 1] {
        1 => DynamicSignatureType::DynamicSignatureTypeEIP712,
        2 => DynamicSignatureType::DynamicSignatureTypeEthSign,
        3 => DynamicSignatureType::DynamicSignatureTypeEIP1271,
        _ => return Err(eyre!("Unexpected DynamicSignatureType value")),
    };

    let recovered_address = match signature_type {
        DynamicSignatureType::DynamicSignatureTypeEthSign |
        DynamicSignatureType::DynamicSignatureTypeEIP712 => {
            let signature_leaf = recover_ecdsa_signature(data, subdigest, starting_index)?;
            signature_leaf.address
        }
        DynamicSignatureType::DynamicSignatureTypeEIP1271 => {
            // The length is the remaining length of the slice
            let signature = Signature(slice[..slice.len() - 1].to_vec());
            // Call the contract on-chain to verify the signature
            let wallet = get_erc_1271_wallet(chain_id, address).await?;
            let res = wallet
                .is_valid_signature(
                    subdigest.to_vec().into(),
                    signature.clone().as_slice().to_vec().into(),
                )
                .await?;
            if res == ERC1271_MAGICVALUE_BYTES32 {
                address
            } else {
                Address::zero()
            }
        }
    };
    info!("recovered address: {}", recovered_address);

    // Revert if the recovered address is not the same as the address
    // if recovered_address != address {
    //     return Err(eyre!("Recovered address does not match the address"));
    // }

    // The length is the remaining length of the slice
    let signature = Signature(slice[..slice.len() - 1].to_vec());

    Ok(DynamicSignatureLeaf {
        address,
        signature_type,
        signature,
        size: (end_index - starting_index) as u32,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::utils::{
        hash_message_bytes32, left_pad_u64_to_bytes32, parse_hex_to_bytes32, to_hex_string,
    };
    use ethers::{
        abi::{encode_packed, Token},
        signers::{LocalWallet, Signer},
        utils::keccak256,
    };

    #[test]
    fn test_userop_recover_eip712() {
        let user_op_hash = parse_hex_to_bytes32(
            "0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a",
        )
        .unwrap();

        // Hash the subdigest w/ https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/ModuleAuth.sol#L60
        let sub_digest = keccak256(
            encode_packed(&[
                Token::String("\x19\x01".to_string()),
                Token::FixedBytes(left_pad_u64_to_bytes32(11155111).to_vec()),
                Token::Address("0x10dbbe70128929723c1b982e53c51653232e4ff2".parse().unwrap()),
                Token::FixedBytes(user_op_hash.to_vec()),
            ])
            .unwrap(),
        );

        // For ECDSASignatureTypeEIP712
        let message = RecoveryMessage::Hash(sub_digest.into());
        let signature = EthersSignature::from_str("0x783610798879fb9af654e2a99929e00e82c3a0f4288c08bc30266b64dc3e23285d634f6658fdeeb5ba9193b5e935a42a1d9bdf5007144707c9082e6eda5d8fbd1b").unwrap();
        let a = signature.recover(message).unwrap();
        assert_eq!(a, "0x6ca6d1e2d5347bfab1d91e883f1915560e09129d".parse().unwrap());
    }

    #[test]
    fn test_userop_recover_eth_sign() {
        let user_op_hash = parse_hex_to_bytes32(
            "0x284707a564a3517ce2285e64b7680c6f93950f696bcfb9b1df9ab218ed14ee2f",
        )
        .unwrap();

        // Hash the subdigest w/ https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/ModuleAuth.sol#L60
        let sub_digest = keccak256(
            encode_packed(&[
                Token::String("\x19\x01".to_string()),
                Token::FixedBytes(left_pad_u64_to_bytes32(11155111).to_vec()),
                Token::Address("0x5D04d44C02ff74C4423F71fA07E51a75E4B9895E".parse().unwrap()),
                Token::FixedBytes(user_op_hash.to_vec()),
            ])
            .unwrap(),
        );
        assert_eq!(
            sub_digest,
            parse_hex_to_bytes32(
                "0x0d6314da272d68aacff4f20b15dce14b118c204cf080a717ed21210121d90c2f"
            )
            .unwrap()
        );

        // For ECDSASignatureTypeEthSign
        println!("hashed: {}", to_hex_string(&hash_message_bytes32(&sub_digest)));
        assert_eq!(
            hash_message_bytes32(&sub_digest),
            parse_hex_to_bytes32(
                "0x17172167775499aece8c32f91904fb2e91e6489630ce1ed056314bead7f408c7"
            )
            .unwrap()
        );

        let message = RecoveryMessage::Hash(hash_message_bytes32(&sub_digest).into());
        let signature = EthersSignature::from_str("0xc2db3b0d1586ddb52005c1b9dbeba001a8c5bd7a6d5d74e6dabf3f79f85c81f43ca3ef079afeec48b9de9e1308b97c7faaab0040cfc0d1594cbc4ca16a5505571b").unwrap();
        let a = signature.recover(message).unwrap();
        assert_eq!(a, "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse().unwrap());
    }

    #[tokio::test]
    async fn test_recover_ecdsa_signature() {
        let wallet = LocalWallet::new(&mut rand::thread_rng());

        let subdigest = [1u8; 32];

        // Sign the subdigest w/ type EIP712
        let signature = wallet.sign_hash(subdigest.into()).unwrap();
        let mut data = signature.clone().to_vec();
        // Set the `ECDSASignatureType` to `ECDSASignatureTypeEIP712`
        data.push(1);

        // Retrieve the signature struct
        let recovered_sig = recover_ecdsa_signature(&data, &subdigest, 0).unwrap();
        assert_eq!(recovered_sig.address, wallet.address());
        assert_eq!(recovered_sig.signature, signature.to_vec().try_into().unwrap());
        assert_eq!(recovered_sig.signature_type, ECDSASignatureType::ECDSASignatureTypeEIP712);

        // Sign the subdigest w/ EIP 191
        let signature = wallet.sign_message(subdigest).await.unwrap();
        let mut data = signature.clone().to_vec();
        // Set the `ECDSASignatureType` to `ECDSASignatureTypeEthSign`
        data.push(2);

        // Retrieve the signature struct
        let recovered_sig = recover_ecdsa_signature(&data, &subdigest, 0).unwrap();

        assert_eq!(recovered_sig.address, wallet.address());
        assert_eq!(recovered_sig.signature, signature.to_vec().try_into().unwrap());
        assert_eq!(recovered_sig.signature_type, ECDSASignatureType::ECDSASignatureTypeEthSign);
    }

    #[tokio::test]
    async fn test_recover_dynamic_signature() {
        let wallet = LocalWallet::new(&mut rand::thread_rng());

        let subdigest = [1u8; 32];

        // Sign the subdigest w/ type EIP712
        let signature = wallet.sign_hash(subdigest.into()).unwrap();
        let mut data = signature.clone().to_vec();
        // Set the `ECDSASignatureType` to `ECDSASignatureTypeEIP712`
        data.push(1);
        // Set the `DynamicSignatureType` to `DynamicSignatureTypeEIP712`
        data.push(1);

        let recovered_sig =
            recover_dynamic_signature(1, &data, &subdigest, wallet.address(), 0, 66).await.unwrap();
        assert_eq!(recovered_sig.address, wallet.address());
        assert_eq!(recovered_sig.signature, signature.to_vec().try_into().unwrap());
        assert_eq!(recovered_sig.signature_type, DynamicSignatureType::DynamicSignatureTypeEIP712);

        // Sign the subdigest w/ EIP 191
        let signature = wallet.sign_message(subdigest).await.unwrap();
        let mut data = signature.clone().to_vec();
        // Set the `ECDSASignatureType` to `ECDSASignatureTypeEthSign`
        data.push(2);
        // Set the `DynamicSignatureType` to `DynamicSignatureTypeEthSign`
        data.push(2);

        let recovered_sig =
            recover_dynamic_signature(1, &data, &subdigest, wallet.address(), 0, 66).await.unwrap();
        assert_eq!(recovered_sig.address, wallet.address());
        assert_eq!(recovered_sig.signature, signature.to_vec().try_into().unwrap());
        assert_eq!(recovered_sig.signature_type, DynamicSignatureType::DynamicSignatureTypeEthSign);
    }
}
