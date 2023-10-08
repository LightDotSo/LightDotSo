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
use std::str::FromStr;

pub(crate) fn recover_ecdsa_signature(
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

pub(crate) async fn recover_dynamic_signature(
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

    // The length is the remaining length of the slice
    let signature = Signature(slice[..slice.len() - 1].to_vec());

    let recovered_address = match signature_type {
        DynamicSignatureType::DynamicSignatureTypeEthSign |
        DynamicSignatureType::DynamicSignatureTypeEIP712 => {
            let signature_leaf = recover_ecdsa_signature(data, subdigest, starting_index)?;
            signature_leaf.address
        }
        DynamicSignatureType::DynamicSignatureTypeEIP1271 => {
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

    // Revert if the recovered address is not the same as the address
    if recovered_address != address {
        return Err(eyre!("Recovered address does not match the address"));
    }

    Ok(DynamicSignatureLeaf { address, signature_type, signature })
}

#[cfg(test)]
mod tests {
    use super::*;
    use ethers::signers::{LocalWallet, Signer};

    #[tokio::test]
    async fn test_recover_ecdsa_signature() {
        let wallet = LocalWallet::new(&mut rand::thread_rng());

        let subdigest = [1u8; 32];

        // Sign the subdigest w/ type EIP712
        let signature = wallet.sign_hash(subdigest.into()).unwrap();
        let mut data = signature.to_vec();
        data.push(1);

        // Retrieve the signature struct
        let recovered_sig = recover_ecdsa_signature(&data, &subdigest, 0).unwrap();
        assert_eq!(recovered_sig.address, wallet.address());
        assert_eq!(recovered_sig.signature_type, ECDSASignatureType::ECDSASignatureTypeEIP712);

        // Sign the subdigest w/ EIP 191
        let signature = wallet.sign_message(subdigest).await.unwrap();
        let mut data = signature.to_vec();
        data.push(2);

        // Retrieve the signature struct
        let recovered_sig = recover_ecdsa_signature(&data, &subdigest, 0).unwrap();

        assert_eq!(recovered_sig.address, wallet.address());
        assert_eq!(recovered_sig.signature_type, ECDSASignatureType::ECDSASignatureTypeEthSign);
    }
}
