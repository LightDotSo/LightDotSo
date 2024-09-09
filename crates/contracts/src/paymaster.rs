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

use crate::{constants::ALCHEMY_V060_GAS_MANAGER_ADDRESS, provider::get_provider};
use alloy::{primitives::Address, providers::RootProvider, sol, transports::BoxTransport};
use eyre::{eyre, Context, Result};
use prisma_client_rust::chrono::NaiveDateTime;
use std::convert::TryInto;
use LightPaymaster::LightPaymasterInstance;

sol!(
    #[sol(rpc)]
    LightPaymaster,
    "abi/LightPaymaster.json"
);

pub async fn get_paymaster(
    chain_id: u64,
    verifying_paymaster_address: Address,
) -> Result<LightPaymasterInstance<BoxTransport, RootProvider<BoxTransport>>> {
    // Get the provider.
    let (provider, _) = get_provider(chain_id).await?;

    // Get the contract.
    let contract = LightPaymaster::new(verifying_paymaster_address, provider);

    // Return the contract.
    Ok(contract)
}

/// Construct the paymaster and data.
#[allow(deprecated)]
pub fn decode_paymaster_and_data(msg: Vec<u8>) -> Result<(Address, u64, u64, Vec<u8>)> {
    // Internal function to make sure the timestamp is valid.
    fn is_valid_timestamp(timestamp: u64) -> bool {
        NaiveDateTime::from_timestamp_opt(timestamp as i64, 0).is_some()
    }

    // Get the verifying paymaster address.
    let verifying_paymaster_address = Address::from_slice(&msg[0..20]);

    // If the verifying paymaster address matches the `ALCHEMY_V060_GAS_MANAGER_ADDRESS`,
    // then the message is encoded differently.
    if verifying_paymaster_address == *ALCHEMY_V060_GAS_MANAGER_ADDRESS {
        // Get the valid until.
        let valid_until = u32::from_be_bytes(
            msg[28..32].try_into().wrap_err("Failed to convert valid_until data")?,
        )
        .into();
        // Get the valid after.
        let valid_after = 0_u64;
        // Get the signature.
        let signature = msg[52..].to_vec();

        // Check if the timestamp is valid.
        if !is_valid_timestamp(valid_until) {
            return Err(eyre!("Invalid timestamp"));
        }

        return Ok((verifying_paymaster_address, valid_until, valid_after, signature));
    }

    // From: https://github.com/pimlicolabs/singleton-paymaster/blob/6f0049330f17b971038f8cf82dac9adc3dbd9c01/src/SingletonPaymasterV6.sol#L61-L90
    // License: MIT
    // Try w/ the offset w/ the `SingletonPaymasterV6`
    if msg.len() == 98 {
        // Get the valid until.
        let valid_until = u64::from_be_bytes(
            [&[0, 0], &msg[21..27]]
                .concat()
                .try_into()
                .map_err(|e| eyre!("Failed to convert valid_until data: {:?}", e))?,
        );
        // Get the valid after.
        let valid_after = u64::from_be_bytes(
            [&[0, 0], &msg[27..33]]
                .concat()
                .try_into()
                .map_err(|e| eyre!("Failed to convert valid_after data: {:?}", e))?,
        );
        // Get the signature.
        let signature = msg[33..].to_vec();

        // Check if the timestamp is valid.
        if is_valid_timestamp(valid_until) && is_valid_timestamp(valid_after) {
            return Ok((verifying_paymaster_address, valid_until, valid_after, signature));
        }
    }

    // Get the valid until.
    let valid_until =
        u64::from_be_bytes(msg[44..52].try_into().wrap_err("Failed to convert valid_until data")?);
    // Get the valid after.
    let valid_after =
        u64::from_be_bytes(msg[76..84].try_into().wrap_err("Failed to convert valid_after data")?);
    // Get the signature.
    let signature = msg[84..].to_vec();

    // Check if the timestamp is valid.
    if !is_valid_timestamp(valid_until) || !is_valid_timestamp(valid_after) {
        return Err(eyre!("Invalid timestamp"));
    }

    Ok((verifying_paymaster_address, valid_until, valid_after, signature))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::LIGHT_PAYMASTER_ADDRESSES;
    use alloy::hex;
    use eyre::Result;

    #[ignore]
    #[tokio::test]
    async fn test_get_paymaster() {
        let chain_id = 1;
        // Get the address
        let verifying_paymaster_address = LIGHT_PAYMASTER_ADDRESSES[0];

        let res = get_paymaster(chain_id, verifying_paymaster_address).await;
        assert!(res.is_ok());

        // If you want to test the details of the resulting contract:
        let contract = res.unwrap();
        assert_eq!(
            contract.address().to_checksum(None),
            verifying_paymaster_address.to_checksum(None)
        );
    }

    #[test]
    fn test_decode_paymaster_and_data() -> Result<()> {
        // Get the expected msg.
        let expected_msg: Vec<u8> = hex::decode("0dcd1bf9a1b36ce34237eeafef220931846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Decode the paymaster and data.
        let (verifying_paymaster_address, valid_until, valid_after, signature) =
            decode_paymaster_and_data(expected_msg)?;

        // Expected result.
        let expected_verifying_paymaster_address: Address =
            "0x0DCd1Bf9A1b36cE34237eEaFef220931846BCD82".parse().unwrap();
        let expected_valid_until = u64::from_str_radix("00000000deadbeef", 16).unwrap();
        let expected_valid_after = u64::from_str_radix("0000000000001234", 16).unwrap();
        let expected_signature: Vec<u8> = hex::decode("dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c").unwrap();

        // Assert that the result matches the expected value
        assert_eq!(verifying_paymaster_address, expected_verifying_paymaster_address);
        assert_eq!(valid_until, expected_valid_until);
        assert_eq!(valid_after, expected_valid_after);
        assert_eq!(signature, expected_signature);

        Ok(())
    }

    // #1
    // https://polygonscan.com/tx/0x3e0b0fbe2036274e96157534a3ab82327113f11881a9a3d34c5dbabc5034d25b
    // Calldata:
    // 0x6df0e4a8000000000000000000000000000000000000000000000000000000000301bf3100000000000000000000000000000000000000000000000000000000000000600000000000000000000000005ff137d4b0fdcd49dca30c7cf57e578a026d278900000000000000000000000000000000000000000000000000000000000004a41fad948c00000000000000000000000000000000000000000000000000000000000000400000000000000000000000002978231d983d32c5ea3e97021e6a7d636ef42bef00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000e9586d5bb60179b9b364c19ce17b995cbe51ce520000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000036000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c882d5d90f13ae7d2866bf58606eb960783bc6d181f0f729f74fae246ea1cf89c00000000000000000000000000000000000000000000000000000018c0fab8bb800000000000000000000000000000000000000000000000000000000000000000000000000000084b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000095000000000003193facb32d1c120719892b7ae977000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000656459c5a8db79acb7d63838be51e9fef633a7bb5cb024c5b00120f3288869d0e052e5395eba458e03a3107e25bab992a1154bf19cb6ca75be8fdcd48845840c2ece416f1b0000000000000000000000000000000000000000000000000000000000000000000000000000000000008d010001000000000001edca1cded6709adedc20cd162fcec52ec826533023457a8b24750fcc320b2a2b68a12ea777093e3066e1f8733d23dce9db6658f8987fb4a47eba45f0a7af5e101c0201012af8ddab77a7c90a38cf26f29763365d0028cfef0101b06a8f16d740df4fcd026b9afad0158b326ac62b0101285f0e30c55d61a3463b85ad189f934d5f48fbdd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    // PaymasterAndData:
    // 0x000000000003193facb32d1c120719892b7ae977000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000656459c5a8db79acb7d63838be51e9fef633a7bb5cb024c5b00120f3288869d0e052e5395eba458e03a3107e25bab992a1154bf19cb6ca75be8fdcd48845840c2ece416f1b

    // #2
    // https://polygonscan.com/tx/0x261f6a7712ca549d53c163b62537d8c147ac98b0d955409f15d0f54a983e7951
    // Calldata:
    // 0x6df0e4a8000000000000000000000000000000000000000000000000000000000301b01300000000000000000000000000000000000000000000000000000000000000600000000000000000000000005ff137d4b0fdcd49dca30c7cf57e578a026d278900000000000000000000000000000000000000000000000000000000000004841fad948c00000000000000000000000000000000000000000000000000000000000000400000000000000000000000002978231d983d32c5ea3e97021e6a7d636ef42bef00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000fbd80fe5ce1ece895845fd131bd621e2b6a1345f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000044e1c000000000000000000000000000000000000000000000000000000000001c4b4000000000000000000000000000000000000000000000000000000000001c4b400000000000000000000000000000000000000000000000000000000d320b3b350000000000000000000000000000000000000000000000000000000b323dbb3100000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000036000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c806eedcf823b5a64f8528accf0d78edb31b7715f351e4c9b6d8b3ac69a16e094e0000000000000000000000000000000000000000000000000000018bac7d2d7700000000000000000000000000000000000000000000000000000000000000000000000000000084b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000095000000000003193facb32d1c120719892b7ae97700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065643124173269fd5124338fe57905c8e9402a934232072eedc3420d5973db004087c40323361543d1ace025caea2b7904d343e6927856318f19fac43ca66a4ef935216a1c00000000000000000000000000000000000000000000000000000000000000000000000000000000000061010001000000000001560d53016ad5d7ee5afd8545206fcfdf2279dce6369e445db6c4c282e6daac676137f6f1d1d02d1fed93a72d2daefaac5dbb517aabb30cfb8687f8c5bcce51ad1b0201017f4c8bd0acc303599a1ae92414b055514ffb6f810000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    // 0x000000000003193facb32d1c120719892b7ae97700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065643124173269fd5124338fe57905c8e9402a934232072eedc3420d5973db004087c40323361543d1ace025caea2b7904d343e6927856318f19fac43ca66a4ef935216a1c

    #[test]
    fn test_decode_paymaster_and_data_raw() -> Result<()> {
        // Get the expected msg.
        let number_one_msg: Vec<u8> = hex::decode("0x000000000003193facb32d1c120719892b7ae977000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000656459c5a8db79acb7d63838be51e9fef633a7bb5cb024c5b00120f3288869d0e052e5395eba458e03a3107e25bab992a1154bf19cb6ca75be8fdcd48845840c2ece416f1b").unwrap();

        // Decode the paymaster and data.
        let (_verifying_paymaster_address, valid_until, valid_after, _signature) =
            decode_paymaster_and_data(number_one_msg)?;

        // Log the result.
        println!("#1");
        println!("valid_until: {:?}", valid_until);
        println!("valid_after: {:?}", valid_after);

        // Get the expected msg.
        let number_two_msg: Vec<u8> = hex::decode("0x000000000003193facb32d1c120719892b7ae97700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065643124173269fd5124338fe57905c8e9402a934232072eedc3420d5973db004087c40323361543d1ace025caea2b7904d343e6927856318f19fac43ca66a4ef935216a1c").unwrap();

        // Decode the paymaster and data.
        let (_verifying_paymaster_address, valid_until, valid_after, _signature) =
            decode_paymaster_and_data(number_two_msg)?;

        // Log the result.
        println!("#2");
        println!("valid_until: {:?}", valid_until);
        println!("valid_after: {:?}", valid_after);

        Ok(())
    }

    // #1
    // https://basescan.org/tx/0x2d73c8ceef8b6299f3e595ae927a094edbfe526c1ea740b157f8d6c16af29828
    // Calldata:
    // 0xb61d27f6000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000001c8fe8502a41a8d1976f78dfe24ed7c11c4f703a000000000000000000000000000000000000000000000000000000000000271000000000000000000000000000000000000000000000000000000000
    // PaymasterAndData:
    // 0xe3dc822d77f8ca7ac74c30b0dffea9fcdcaaa32100000000000000000000000000000000000000000000000000000000668402bc00000000000000000000000000000000000000000000000000000000000000009103b16eef142ff044288bc9c89812c5656a246a466cd024e7a86bc0eac13ee17f356f203dc99326d5ae0b7e7dd65df065bbf4dff0251c54952eaa2874d8a0571c

    #[test]
    fn test_decode_paymaster_and_data_pimlico() -> Result<()> {
        // Get the expected msg.
        let number_one_msg: Vec<u8> = hex::decode("0xe3dc822d77f8ca7ac74c30b0dffea9fcdcaaa32100000000000000000000000000000000000000000000000000000000668402bc00000000000000000000000000000000000000000000000000000000000000009103b16eef142ff044288bc9c89812c5656a246a466cd024e7a86bc0eac13ee17f356f203dc99326d5ae0b7e7dd65df065bbf4dff0251c54952eaa2874d8a0571c").unwrap();

        // Decode the paymaster and data.
        let (verifying_paymaster_address, valid_until, valid_after, _signature) =
            decode_paymaster_and_data(number_one_msg)?;

        // Log the result.
        println!("#1");
        println!("verifying_paymaster_address: {:?}", verifying_paymaster_address);
        println!("valid_until: {:?}", valid_until);
        println!("valid_after: {:?}", valid_after);

        Ok(())
    }

    #[test]
    fn test_decode_paymaster_and_data_alchemy() -> Result<()> {
        // Get the expected msg.
        let number_one_msg: Vec<u8> = hex::decode("0x4fd9098af9ddcb41da48a1d78f91f1398965addc00000000000000006685d0520000000000000000000000000000000000000000bab40d3c364ad63d5bcf59da8a8c872a2c6f2aad81a4bd8b46812e16271855115b9d6479508ad438ad247884664ef7cb40cbc1898891f08da75509df37e089051c").unwrap();

        // Decode the paymaster and data.
        let (verifying_paymaster_address, valid_until, valid_after, signature) =
            decode_paymaster_and_data(number_one_msg)?;

        // Log the result.
        println!("#1");
        println!("verifying_paymaster_address: {:?}", verifying_paymaster_address);
        println!("valid_until: {:?}", valid_until);
        println!("valid_after: {:?}", valid_after);

        // Convert each byte to a hex string and concatenate them
        let mut hex_string = String::new();
        for byte in signature {
            hex_string.push_str(&format!("{:02x}", byte));
        }

        println!("signature: 0x{}", hex_string);

        Ok(())
    }

    #[test]
    fn test_decode_paymaster_and_data_full() -> Result<()> {
        // Get the expected msg.
        let msgs: Vec<Vec<u8>> = vec![
            hex::decode("0x00000000000000fb866daaa79352cc568a005d9600000066df3c170000000000002fb0f267b69d35bf8a1792423ad9ff7591a15d6a2d533f4d08e989b89f1a2cd27d9198683f61a499ec2b262649acb9f4da3acf33db335064bf002a83b6b3c6c91c").unwrap(),
            hex::decode("0x00000000000000fb866daaa79352cc568a005d9600000066df3c180000000000007253e8abd8dd910c6388e665c073882bb51d99d4b5f6a00ef2e705e14c8861fd3119de93e83cefa84012c195970fff1e6fa377bf190425787deff168a901e3a61b").unwrap(),
            hex::decode("0x00000000000000fb866daaa79352cc568a005d9600000066df3c16000000000000c1197123600c9f913325219385e1a9e169c48ba8570f7caa6f49e80ad24cb51143e208994ab5b2216177bb3058de17ec9ac41ea8f6596f8fffbc0a55216234e41b").unwrap(),
        ];

        for msg in msgs {
            // Decode the paymaster and data.
            let res = decode_paymaster_and_data(msg.clone());

            // Assert that the result is not an error.
            assert!(res.is_ok());
        }

        Ok(())
    }
}
