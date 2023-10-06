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

use crate::types::WalletConfig;
use ethers::{
    abi::{encode, encode_packed, Token},
    types::{Address, Bytes, H256, U256},
    utils::{get_create2_address_from_hash, hex, keccak256},
};
use eyre::Result;
use lightdotso_contracts::constants::{
    LIGHT_WALLET_FACTORY_ADDRESS, LIGHT_WALLET_FACTORY_IMPLEMENTATION_ADDRESS,
};

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
    // License: Apache-2.0
    let mut padded = [0u8; 32];
    padded[32 - bytes.0.len()..].copy_from_slice(&bytes.0);

    let threshold_bytes = keccak256(encode(&[
        Token::FixedBytes(padded.to_vec()),
        Token::Uint(U256::from(wallet_config.threshold)),
    ]));

    // Encode the checkpoint into bytes
    let checkpoint_bytes = keccak256(encode(&[
        Token::FixedBytes(threshold_bytes.to_vec()),
        Token::Uint(U256::from(wallet_config.checkpoint)),
    ]));

    Ok(format!("0x{}", ethers::utils::hex::encode(checkpoint_bytes)))
}

const PROXY_CREATION_CODE: &str = "0x608060405260405161078438038061078483398101604081905261002291610319565b61002e82826000610035565b5050610436565b61003e8361006b565b60008251118061004b5750805b156100665761006483836100ab60201b6100291760201c565b505b505050565b610074816100d7565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60606100d0838360405180606001604052806027815260200161075d602791396101a9565b9392505050565b6100ea8161022260201b6100551760201c565b6101515760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b60648201526084015b60405180910390fd5b806101887f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b61023160201b6100711760201c565b80546001600160a01b0319166001600160a01b039290921691909117905550565b6060600080856001600160a01b0316856040516101c691906103e7565b600060405180830381855af49150503d8060008114610201576040519150601f19603f3d011682016040523d82523d6000602084013e610206565b606091505b50909250905061021886838387610234565b9695505050505050565b6001600160a01b03163b151590565b90565b606083156102a357825160000361029c576001600160a01b0385163b61029c5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610148565b50816102ad565b6102ad83836102b5565b949350505050565b8151156102c55781518083602001fd5b8060405162461bcd60e51b81526004016101489190610403565b634e487b7160e01b600052604160045260246000fd5b60005b838110156103105781810151838201526020016102f8565b50506000910152565b6000806040838503121561032c57600080fd5b82516001600160a01b038116811461034357600080fd5b60208401519092506001600160401b038082111561036057600080fd5b818501915085601f83011261037457600080fd5b815181811115610386576103866102df565b604051601f8201601f19908116603f011681019083821181831017156103ae576103ae6102df565b816040528281528860208487010111156103c757600080fd5b6103d88360208301602088016102f5565b80955050505050509250929050565b600082516103f98184602087016102f5565b9190910192915050565b60208152600082518060208401526104228160408501602087016102f5565b601f01601f19169190910160400192915050565b610318806104456000396000f3fe60806040523661001357610011610017565b005b6100115b610027610022610074565b6100b9565b565b606061004e83836040518060600160405280602781526020016102e5602791396100dd565b9392505050565b73ffffffffffffffffffffffffffffffffffffffff163b151590565b90565b60006100b47f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5473ffffffffffffffffffffffffffffffffffffffff1690565b905090565b3660008037600080366000845af43d6000803e8080156100d8573d6000f35b3d6000fd5b60606000808573ffffffffffffffffffffffffffffffffffffffff16856040516101079190610277565b600060405180830381855af49150503d8060008114610142576040519150601f19603f3d011682016040523d82523d6000602084013e610147565b606091505b509150915061015886838387610162565b9695505050505050565b606083156101fd5782516000036101f65773ffffffffffffffffffffffffffffffffffffffff85163b6101f6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064015b60405180910390fd5b5081610207565b610207838361020f565b949350505050565b81511561021f5781518083602001fd5b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101ed9190610293565b60005b8381101561026e578181015183820152602001610256565b50506000910152565b60008251610289818460208701610253565b9190910192915050565b60208152600082518060208401526102b2816040850160208701610253565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016919091016040019291505056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a164736f6c6343000812000a416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564";

pub fn get_address(hash: H256, salt: H256) -> Address {
    let implementation: Address = *LIGHT_WALLET_FACTORY_IMPLEMENTATION_ADDRESS;

    let selector = keccak256("initialize(bytes32)");
    let (selector_slice, _) = selector.split_at(4);

    let and = encode_packed(&[
        Token::FixedBytes(selector_slice.to_vec()),
        Token::FixedBytes(hash.to_fixed_bytes().to_vec()),
    ])
    .unwrap();

    let input = encode(&[Token::Address(implementation), Token::Bytes(and)]);

    let inal = encode_packed(&[
        Token::Bytes(hex::decode(PROXY_CREATION_CODE).unwrap()),
        Token::Bytes(input),
    ])
    .unwrap();

    let init_code_hash = keccak256(inal);

    let factory: Address = *LIGHT_WALLET_FACTORY_ADDRESS;

    get_create2_address_from_hash(factory, salt, init_code_hash)
}

#[cfg(test)]
mod tests {
    use crate::types::Signer;

    use super::*;

    #[test]
    fn test_image_hash_of_wallet_config() {
        // From: contracts/src/test/utils/LightWalletUtils.sol
        let wc = WalletConfig {
            checkpoint: 1,
            threshold: 1,
            weight: 1,
            image_hash: [0; 31]
                .iter()
                .chain(&[1])
                .copied()
                .collect::<Vec<u8>>()
                .try_into()
                .unwrap(),
            signers: vec![Signer {
                weight: 1,
                address: "0x6CA6d1e2D5347Bfab1d91e883F1915560e09129D".parse().unwrap(),
            }],
        };

        let expected = "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6";
        assert_eq!(expected, image_hash_of_wallet_config(wc).unwrap());
    }

    #[test]
    fn test_get_address() {
        let hash: H256 =
            "0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6".parse().unwrap();
        let nonce: H256 =
            "0x0000000000000000000000000000000000000000000000000000000000000001".parse().unwrap();

        let expected: Address = "0x10DbbE70128929723c1b982e53c51653232e4Ff2".parse().unwrap();

        assert_eq!(expected, get_address(hash, nonce));
    }
}
