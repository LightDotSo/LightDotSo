// Copyright 2023-2024 LightDotSo.
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

use crate::address::{
    LIGHT_WALLET_FACTORY_ADDRESS, LIGHT_WALLET_FACTORY_IMPLEMENTATION_ADDRESS,
    LIGHT_WALLET_FACTORY_V010_ADDRESS, LIGHT_WALLET_FACTORY_V020_ADDRESS,
    LIGHT_WALLET_FACTORY_V030_ADDRESS,
};
use alloy::{
    dyn_abi::DynSolValue,
    hex,
    primitives::{keccak256, Address, FixedBytes, B256},
};
use eyre::{eyre, Result};

// This is the proxy creation code for `ERC1967Proxy` used in factory `v0.1.0` and `v0.2.0`
const PROXY_CREATION_CODE_V1: &str = "0x608060405260405161078438038061078483398101604081905261002291610319565b61002e82826000610035565b5050610436565b61003e8361006b565b60008251118061004b5750805b156100665761006483836100ab60201b6100291760201c565b505b505050565b610074816100d7565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60606100d0838360405180606001604052806027815260200161075d602791396101a9565b9392505050565b6100ea8161022260201b6100551760201c565b6101515760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b60648201526084015b60405180910390fd5b806101887f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b61023160201b6100711760201c565b80546001600160a01b0319166001600160a01b039290921691909117905550565b6060600080856001600160a01b0316856040516101c691906103e7565b600060405180830381855af49150503d8060008114610201576040519150601f19603f3d011682016040523d82523d6000602084013e610206565b606091505b50909250905061021886838387610234565b9695505050505050565b6001600160a01b03163b151590565b90565b606083156102a357825160000361029c576001600160a01b0385163b61029c5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610148565b50816102ad565b6102ad83836102b5565b949350505050565b8151156102c55781518083602001fd5b8060405162461bcd60e51b81526004016101489190610403565b634e487b7160e01b600052604160045260246000fd5b60005b838110156103105781810151838201526020016102f8565b50506000910152565b6000806040838503121561032c57600080fd5b82516001600160a01b038116811461034357600080fd5b60208401519092506001600160401b038082111561036057600080fd5b818501915085601f83011261037457600080fd5b815181811115610386576103866102df565b604051601f8201601f19908116603f011681019083821181831017156103ae576103ae6102df565b816040528281528860208487010111156103c757600080fd5b6103d88360208301602088016102f5565b80955050505050509250929050565b600082516103f98184602087016102f5565b9190910192915050565b60208152600082518060208401526104228160408501602087016102f5565b601f01601f19169190910160400192915050565b610318806104456000396000f3fe60806040523661001357610011610017565b005b6100115b610027610022610074565b6100b9565b565b606061004e83836040518060600160405280602781526020016102e5602791396100dd565b9392505050565b73ffffffffffffffffffffffffffffffffffffffff163b151590565b90565b60006100b47f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5473ffffffffffffffffffffffffffffffffffffffff1690565b905090565b3660008037600080366000845af43d6000803e8080156100d8573d6000f35b3d6000fd5b60606000808573ffffffffffffffffffffffffffffffffffffffff16856040516101079190610277565b600060405180830381855af49150503d8060008114610142576040519150601f19603f3d011682016040523d82523d6000602084013e610147565b606091505b509150915061015886838387610162565b9695505050505050565b606083156101fd5782516000036101f65773ffffffffffffffffffffffffffffffffffffffff85163b6101f6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064015b60405180910390fd5b5081610207565b610207838361020f565b949350505050565b81511561021f5781518083602001fd5b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101ed9190610293565b60005b8381101561026e578181015183820152602001610256565b50506000910152565b60008251610289818460208701610253565b9190910192915050565b60208152600082518060208401526102b2816040850160208701610253565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016919091016040019291505056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a164736f6c6343000812000a416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564";

const PROXY_CREATION_CODE_V2: &str =
"0x60806040526040516103f43803806103f483398101604081905261002291610268565b61002c8282610033565b5050610358565b61003c82610092565b6040516001600160a01b038316907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a280511561008657610081828261010e565b505050565b61008e610185565b5050565b806001600160a01b03163b6000036100cd57604051634c9c8ce360e01b81526001600160a01b03821660048201526024015b60405180910390fd5b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc80546001600160a01b0319166001600160a01b0392909216919091179055565b6060600080846001600160a01b03168460405161012b919061033c565b600060405180830381855af49150503d8060008114610166576040519150601f19603f3d011682016040523d82523d6000602084013e61016b565b606091505b50909250905061017c8583836101a6565b95945050505050565b34156101a45760405163b398979f60e01b815260040160405180910390fd5b565b6060826101bb576101b682610205565b6101fe565b81511580156101d257506001600160a01b0384163b155b156101fb57604051639996b31560e01b81526001600160a01b03851660048201526024016100c4565b50805b9392505050565b8051156102155780518082602001fd5b604051630a12f52160e11b815260040160405180910390fd5b634e487b7160e01b600052604160045260246000fd5b60005b8381101561025f578181015183820152602001610247565b50506000910152565b6000806040838503121561027b57600080fd5b82516001600160a01b038116811461029257600080fd5b60208401519092506001600160401b038111156102ae57600080fd5b8301601f810185136102bf57600080fd5b80516001600160401b038111156102d8576102d861022e565b604051601f8201601f19908116603f011681016001600160401b03811182821017156103065761030661022e565b60405281815282820160200187101561031e57600080fd5b61032f826020830160208601610244565b8093505050509250929050565b6000825161034e818460208701610244565b9190910192915050565b608e806103666000396000f3fe6080604052600a600c565b005b60186014601a565b605e565b565b600060597f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5473ffffffffffffffffffffffffffffffffffffffff1690565b905090565b3660008037600080366000845af43d6000803e808015607c573d6000f35b3d6000fdfea164736f6c634300081b000a";

// From: https://github.com/rollchad/stylus-create2/blob/571f3a9a1bc2a4a568772dbbcc1383faa5753313/crates/factory/src/lib.rs#L43-L61

fn get_create2_address(from: Address, salt: B256, init_code_hash: B256) -> Address {
    let mut bytes = Vec::with_capacity(1 + 20 + salt.len() + init_code_hash.len());

    bytes.push(0xff);
    bytes.extend_from_slice(from.as_slice());
    bytes.extend_from_slice(salt.as_slice());
    bytes.extend_from_slice(init_code_hash.as_slice());

    let hash = keccak256(bytes.as_slice());

    let mut address_bytes = [0u8; 20];
    address_bytes.copy_from_slice(&hash[12..]);

    Address::from_slice(&address_bytes)
}

pub fn get_address(factory: Address, hash: B256, salt: B256) -> Result<Address> {
    let implementation: Address = *LIGHT_WALLET_FACTORY_IMPLEMENTATION_ADDRESS;

    let selector = keccak256("initialize(bytes32)");
    let (selector_slice, _) = selector.split_at(4);

    let proxy_code = if factory == *LIGHT_WALLET_FACTORY_V010_ADDRESS ||
        factory == *LIGHT_WALLET_FACTORY_V020_ADDRESS
    {
        PROXY_CREATION_CODE_V1
    } else if factory == *LIGHT_WALLET_FACTORY_V030_ADDRESS {
        PROXY_CREATION_CODE_V2
    } else {
        return Err(eyre!("Invalid factory address"));
    };

    let init_code_hash = keccak256(
        DynSolValue::Tuple(vec![
            DynSolValue::Bytes(hex::decode(proxy_code)?),
            DynSolValue::Bytes(
                DynSolValue::Tuple(vec![
                    DynSolValue::Address(implementation),
                    DynSolValue::Bytes(
                        DynSolValue::Tuple(vec![
                            DynSolValue::Bytes(selector_slice.to_vec()),
                            DynSolValue::FixedBytes(FixedBytes::from_slice(hash.as_ref()), 32),
                        ])
                        .abi_encode_packed(),
                    ),
                ])
                .abi_encode_params(),
            ),
        ])
        .abi_encode_packed(),
    );

    let factory: Address = *LIGHT_WALLET_FACTORY_ADDRESS;

    Ok(get_create2_address(factory, salt, init_code_hash))
}

#[cfg(test)]
mod tests {
    use crate::address::LIGHT_WALLET_FACTORY_V010_ADDRESS;

    use super::*;
    use alloy::primitives::B256;
    use lightdotso_common::traits::VecU8ToHex;

    #[test]
    fn test_get_address() -> Result<()> {
        let hash: B256 =
            "0x3c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e95".parse()?;
        let nonce: B256 =
            "0x0000000000000000000000000000000000000000000000000000018e21cdb159".parse()?;

        let expected: Address = "0xc0d0a645fba3a5f761042fa1d5002491c0e515ac".parse()?;

        assert_eq!(expected, get_address(*LIGHT_WALLET_FACTORY_V010_ADDRESS, hash, nonce)?);

        Ok(())
    }

    #[test]
    fn test_get_address_v030() -> Result<()> {
        let hash: B256 =
            "0x0000000000000000000000000000000000000000000000000000000000000001".parse()?;
        let nonce: B256 =
            "0x0000000000000000000000000000000000000000000000000000000000000000".parse()?;

        let expected: Address = "0x800955D6AdD83b40cE02760171998715446e0C31".parse()?;

        assert_eq!(expected, get_address(*LIGHT_WALLET_FACTORY_V030_ADDRESS, hash, nonce)?);

        Ok(())
    }

    #[test]
    fn test_get_create2_address() -> Result<()> {
        let from: Address = "0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496".parse()?;
        let salt: B256 =
            "0x0000000000000000000000000000000000000000000000000000000000000000".parse()?;
        let init_code_hash: B256 =
            "0x0000000000000000000000000000000000000000000000000000000000000000".parse()?;

        let expected: Address = "0xE7c71753BE6a2Ce12d01214aFA1CCB0Ff876f3A5".parse()?;

        assert_eq!(expected, get_create2_address(from, salt, init_code_hash));

        Ok(())
    }

    #[test]
    fn test_get_init_code_hash() -> Result<()> {
        let selector = keccak256("initialize(bytes32)");
        let (selector_slice, _) = selector.split_at(4);

        let hash: B256 =
            "0x0000000000000000000000000000000000000000000000000000000000000000".parse()?;

        let computed_initialize_bytes = DynSolValue::Tuple(vec![
            DynSolValue::Bytes(selector_slice.to_vec()),
            DynSolValue::FixedBytes(FixedBytes::from_slice(hash.as_ref()), 32),
        ])
        .abi_encode_packed();

        let expected = hex::decode(
            "0x9498bd710000000000000000000000000000000000000000000000000000000000000000",
        )?;

        println!("{:?}", computed_initialize_bytes.to_hex_string());
        assert_eq!(computed_initialize_bytes, expected);

        let implementation: Address = Address::ZERO;

        let computed_initialize_full = DynSolValue::Tuple(vec![
            DynSolValue::Address(implementation),
            DynSolValue::Bytes(
                DynSolValue::Tuple(vec![
                    DynSolValue::Bytes(selector_slice.to_vec()),
                    DynSolValue::FixedBytes(FixedBytes::from_slice(hash.as_ref()), 32),
                ])
                .abi_encode_packed(),
            ),
        ])
        .abi_encode_params();

        let expected_initialize_full = hex::decode(
            "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000249498bd71000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        )?;

        println!("{:?}", computed_initialize_full.to_hex_string());
        println!("{:?}", expected_initialize_full.to_hex_string());
        assert_eq!(
            computed_initialize_full.to_hex_string(),
            expected_initialize_full.to_hex_string()
        );
        assert_eq!(computed_initialize_full, expected_initialize_full);

        Ok(())
    }
}