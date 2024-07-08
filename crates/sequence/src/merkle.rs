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

use ethers::abi::{encode, encode_packed, Token};
use eyre::Result;

pub fn render_merkle(
    merkle_root: [u8; 32],
    merkle_proofs: Vec<[u8; 32]>,
    signature: Vec<u8>,
) -> Result<Vec<u8>> {
    Ok(encode_packed(&[
        // Encode as the merkle indicator
        Token::Bytes(vec![0x04]),
        // Encode the merkle root, proofs and signature
        Token::Bytes(encode(&[
            Token::FixedBytes(merkle_root.to_vec()),
            Token::Array(
                merkle_proofs.into_iter().map(|x| Token::FixedBytes(x.to_vec())).collect(),
            ),
            Token::Bytes(signature),
        ])),
    ])?)
}

#[cfg(test)]
mod tests {
    use crate::utils::parse_hex_to_bytes32;
    use ethers::utils::hex;

    use super::*;

    #[test]
    fn test_render_merkle() -> Result<()> {
        let merkle_root_hex = "0x9ca174e7f8cbb8170c135f1a5a9a5ad293916907ef44f87b4f960278f0a686b2";
        let merkle_root = parse_hex_to_bytes32(merkle_root_hex)?;

        let merkle_proofs_hex =
            vec!["0x62b3593f95d92384963531ae52b0cf95d43d0964939e71ad51a76b8048373310"];
        let merkle_proofs = merkle_proofs_hex
            .into_iter()
            .map(parse_hex_to_bytes32)
            .collect::<Result<Vec<[u8; 32]>>>()?;

        let signature_hex = "0x158aa56ea34c217ad11df23a1ee6f0fe36e41bbb34f1e403220604b782b19c7e17e63ad5fe3484b7305fd8c8d4bae55329f5b7dbee5c7807b9f88e4463c1339f1b02";
        let signature = hex::decode(signature_hex)?;

        let result = render_merkle(merkle_root, merkle_proofs, signature)?;

        // Print the result as hex
        println!("0x{}", hex::encode(result));

        Ok(())
    }
}
