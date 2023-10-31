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
    types::{Address, Bytes, Signature, U256},
    utils::hash_message,
};
use lightdotso_common::traits::{HexToBytes, VecU8ToHex};
use lightdotso_contracts::paymaster::{get_paymaster, UserOperation};
use lightdotso_paymaster::{
    paymaster::{construct_paymaster_and_data, get_hash},
    types::UserOperationConstruct,
};
use std::str::FromStr;

#[test]
fn test_signer_recover() {
    let message = hash_message(
        "0xe346f761cfbe02196e8574dc3b84ba8790b3c2ed1797a9bd38f20d7241384043"
            .hex_to_bytes32()
            .unwrap(),
    );
    let signature = Signature::from_str("0x7aa4d7dde12ce361190637ce0f9b01a25c56e4534fcc109786711a4b4f31a25b2e466d22b611a03e4743acf3ad3fd671ab2316f8101c7923700b63e586fa954e1c").unwrap();
    let a = signature.recover(message).unwrap();
    assert_eq!(a, "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf".parse().unwrap());
}

#[test]
fn test_signer_kms_recover() {
    let message = hash_message(
        "0xac535f45fc7e30693c690e0afc584cc8db9a8bd72925e816b47aa560ee1f2919"
            .hex_to_bytes32()
            .unwrap(),
    );
    let signature = Signature::from_str("0x12223eb2d9c0e26f3d61e756fd06b0e1ef090a91ed0cca931720ed7e137f08911b44013b7efa1ec9e9659a48a506adf4c8749491eeed4290a9200b6b48d04ca571").unwrap();

    let id = signature.recovery_id().unwrap();
    println!("id: {:?}", id);

    // Overwrite the recovery id
    let signature = Signature { r: signature.r, s: signature.s, v: (u8::from(id) + 27).into() };

    let recovered_address = signature.recover(message).unwrap();
    assert_eq!(recovered_address, "0xeedeadba8cac470fdce318892a07abe26aa4ab17".parse().unwrap());
}

#[tokio::test]
async fn test_get_hash_iteration() {
    async fn test_get_compare_user_operation(
        chain_id: u64,
        verifying_paymaster_address: Address,
        user_operation: UserOperationConstruct,
    ) {
        // Temporarily clone the user operation.
        let user_operation_clone = user_operation.clone();
        let valid_until = 0_u64;
        let valid_after = 0_u64;

        let result = get_hash(
            chain_id,
            verifying_paymaster_address,
            user_operation,
            valid_until,
            valid_after,
            0,
        );

        let contract = get_paymaster(chain_id, verifying_paymaster_address).await.unwrap();
        let user_operation = user_operation_clone.clone();

        // Get the hash.
        let onchain_hash = contract
            .get_hash(
                UserOperation {
                    sender: user_operation.sender,
                    nonce: user_operation.nonce,
                    init_code: user_operation.init_code,
                    call_data: user_operation.call_data,
                    call_gas_limit: user_operation.call_gas_limit,
                    verification_gas_limit: user_operation.verification_gas_limit,
                    pre_verification_gas: user_operation.pre_verification_gas,
                    max_fee_per_gas: user_operation.max_fee_per_gas,
                    max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas,
                    paymaster_and_data: construct_paymaster_and_data(
                        verifying_paymaster_address,
                        valid_until,
                        valid_after,
                        None,
                    ),
                    signature: Bytes::default(),
                },
                valid_until,
                valid_after,
            )
            .await
            .unwrap();

        let result = result.unwrap();

        println!("result: {}", result.to_vec().to_hex_string());
        println!("onchain_hash: {}", onchain_hash.to_vec().to_hex_string());

        // Assert that the result matches the expected value
        assert_eq!(result, onchain_hash);
    }

    // Arbitrary test inputs #1
    let chain_id = 1;
    let verifying_paymaster_address: Address =
        "0x000000000003193FAcb32D1C120719892B7AE977".parse().unwrap();
    let user_operation = UserOperationConstruct {
        sender: Address::zero(),
        nonce: U256::from(0),
        init_code: "0x".parse().unwrap(),
        call_data: "0x".parse().unwrap(),
        call_gas_limit: U256::from(0),
        verification_gas_limit: U256::from(0),
        pre_verification_gas: U256::from(0),
        max_fee_per_gas: U256::from(0),
        max_priority_fee_per_gas: U256::from(0),
        signature: "0x".parse().unwrap(),
    };

    test_get_compare_user_operation(chain_id, verifying_paymaster_address, user_operation.clone())
        .await;

    // Arbitrary test inputs #2
    let chain_id = 11155111;
    let verifying_paymaster_address: Address =
        "0x000000000003193FAcb32D1C120719892B7AE977".parse().unwrap();
    let user_operation = UserOperationConstruct {
        sender: Address::zero(),
        nonce: U256::from(0),
        init_code: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
        call_data: "0x".parse().unwrap(),
        call_gas_limit: U256::from(4514240),
        verification_gas_limit: U256::from(1854272),
        pre_verification_gas: U256::from(1854272),
        max_fee_per_gas: U256::from(56674171701_i64),
        max_priority_fee_per_gas: U256::from(48087546673_i64),
        signature: "0x".parse().unwrap(),
    };

    test_get_compare_user_operation(chain_id, verifying_paymaster_address, user_operation.clone())
        .await;

    // Arbitrary test inputs #3
    let chain_id = 11155111;
    let verifying_paymaster_address: Address =
        "0x000000000003193FAcb32D1C120719892B7AE977".parse().unwrap();
    let user_operation = UserOperationConstruct {
        sender: Address::zero(),
        nonce: U256::from(0),
        init_code: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
        call_data: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
        call_gas_limit: U256::from(4514240),
        verification_gas_limit: U256::from(1854272),
        pre_verification_gas: U256::from(1854272),
        max_fee_per_gas: U256::from(56674171701_i64),
        max_priority_fee_per_gas: U256::from(48087546673_i64),
        signature: "0x".parse().unwrap(),
    };

    test_get_compare_user_operation(chain_id, verifying_paymaster_address, user_operation.clone())
        .await;

    // Arbitrary test inputs #4
    let chain_id = 137;
    let verifying_paymaster_address: Address =
        "0x000000000003193FAcb32D1C120719892B7AE977".parse().unwrap();
    let user_operation = UserOperationConstruct {
        // sender: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse().unwrap(),
        sender: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A4000".parse().unwrap(),
        nonce: U256::from(1),
        init_code: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
        call_data: "0x0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758".parse().unwrap(),
        call_gas_limit: U256::from(4514240),
        verification_gas_limit: U256::from(1854272),
        pre_verification_gas: U256::from(1854272),
        max_fee_per_gas: U256::from(56674171701_i64),
        max_priority_fee_per_gas: U256::from(48087546673_i64),
        signature: "0x".parse().unwrap(),
    };

    test_get_compare_user_operation(chain_id, verifying_paymaster_address, user_operation.clone())
        .await;
}
