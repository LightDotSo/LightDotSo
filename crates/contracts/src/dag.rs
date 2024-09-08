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

// // Copyright 2023-2024 LightDotSo.
// //
// // Licensed under the Apache License, Version 2.0 (the "License");
// // you may not use this file except in compliance with the License.
// // You may obtain a copy of the License at
// //
// //   http://www.apache.org/licenses/LICENSE-2.0
// //
// // Unless required by applicable law or agreed to in writing, software
// // distributed under the License is distributed on an "AS IS" BASIS,
// // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// // See the License for the specific language governing permissions and
// // limitations under the License.

// use abi::{decode, InvalidOutputType, ParamType, Token, Tokenizable, TokenizableItem};
// use ethers::{
//     prelude::*,
//     types::{Bytes, H256},
// };

// #[derive(Clone, Debug, PartialEq, Eq)]
// pub struct Operation {
//     hash: H256,
//     condition_data: Vec<Bytes>,
//     dependencies: Vec<H256>,
//     fallback_operation: H256,
// }

// #[derive(Clone, Debug, PartialEq, Eq)]
// pub struct OperationRoot {
//     root: H256,
//     operations: Vec<Operation>,
// }

// impl Tokenizable for Operation {
//     fn from_token(token: Token) -> Result<Self, InvalidOutputType> {
//         if let Token::Tuple(tokens) = token {
//             let hash = H256::from_token(tokens[0].clone())?;
//             let condition_data = Vec::<Bytes>::from_token(tokens[1].clone())?;
//             let dependencies = Vec::<H256>::from_token(tokens[2].clone())?;
//             let fallback_operation = H256::from_token(tokens[3].clone())?;

//             Ok(Operation { hash, condition_data, dependencies, fallback_operation })
//         } else {
//             Err(InvalidOutputType("Expected tuple for Operation".to_string()))
//         }
//     }

//     fn into_token(self) -> Token {
//         Token::Tuple(vec![
//             self.hash.into_token(),
//             self.condition_data.into_token(),
//             self.dependencies.into_token(),
//             self.fallback_operation.into_token(),
//         ])
//     }
// }

// impl TokenizableItem for Operation {}

// impl Tokenizable for OperationRoot {
//     fn from_token(token: Token) -> Result<Self, InvalidOutputType> {
//         if let Token::Tuple(tokens) = token {
//             Ok(OperationRoot {
//                 root: H256::from_token(tokens[0].clone())?,
//                 operations: Vec::<Operation>::from_token(tokens[1].clone())?,
//             })
//         } else {
//             Err(InvalidOutputType("Expected tuple for OperationRoot".to_string()))
//         }
//     }

//     fn into_token(self) -> Token {
//         Token::Tuple(vec![self.root.into_token(), self.operations.into_token()])
//     }
// }

// pub fn encode_operation_root(operation_root: &OperationRoot) -> Vec<u8> {
//     let tokens = operation_root.clone().into_token();
//     ethers::abi::encode(&[tokens])
// }

// pub fn decode_operation_root(encoded: &[u8]) -> Result<OperationRoot, AbiError> {
//     let param_types = vec![ParamType::Tuple(vec![
//         ParamType::FixedBytes(32),
//         ParamType::Array(Box::new(ParamType::Tuple(vec![
//             ParamType::FixedBytes(32),
//             ParamType::Array(Box::new(ParamType::Bytes)),
//             ParamType::Array(Box::new(ParamType::FixedBytes(32))),
//             ParamType::FixedBytes(32),
//         ]))),
//     ])];

//     // Decode the encoded bytes into tokens
//     let tokens = decode(&param_types, encoded)?;

//     // Convert the first token back into an OperationRoot instance
//     Ok(OperationRoot::from_token(tokens[0].clone())?)
// }

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use ethers::types::{Bytes, H256};

//     // Helper function to create a sample OperationRoot
//     fn sample_operation_root() -> OperationRoot {
//         OperationRoot {
//             root: H256::random(),
//             operations: vec![Operation {
//                 hash: H256::random(),
//                 condition_data: vec![Bytes::from(vec![0u8, 1u8, 2u8])],
//                 dependencies: vec![H256::random(), H256::random()],
//                 fallback_operation: H256::random(),
//             }],
//         }
//     }

//     #[test]
//     fn test_encode_decode() {
//         let operation_root = sample_operation_root();

//         // Encode the OperationRoot
//         let encoded = encode_operation_root(&operation_root);

//         // Decode the encoded data
//         let decoded = decode_operation_root(&encoded).expect("Decoding failed");

//         // Check if the decoded data matches the original
//         assert_eq!(decoded, operation_root, "Decoded data does not match original");
//     }

//     #[test]
//     fn test_empty_operations() {
//         let mut operation_root = sample_operation_root();
//         operation_root.operations.clear();

//         // Encode the OperationRoot with no operations
//         let encoded = encode_operation_root(&operation_root);

//         // Decode the encoded data
//         let decoded = decode_operation_root(&encoded).expect("Decoding failed");

//         // Check if the decoded data matches the original (empty operations)
//         assert_eq!(
//             decoded, operation_root,
//             "Decoded data does not match original with empty operations"
//         );
//     }
// }
