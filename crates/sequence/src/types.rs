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

#![allow(clippy::expect_used)]

use alloy::{
    hex,
    primitives::{Address, B256},
};
use serde::{
    de::{self, Visitor},
    Deserialize, Deserializer, Serialize, Serializer,
};
use serde_with::serde_as;
use std::convert::TryFrom;

#[derive(Clone, PartialEq)]
pub struct Signature(pub Vec<u8>);

/// The struct representation of a wallet signer
/// Derived from: https://github.com/0xsequence/go-sequence/blob/eabca0c348b5d87dd943a551908c80f61c347899/config.go#L17
/// License: Apache-2.0
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Signer {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub weight: Option<u8>,
    pub leaf: SignatureLeaf,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct SignerNode {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub signer: Option<Signer>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub left: Option<Box<SignerNode>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub right: Option<Box<SignerNode>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", content = "content")]
pub enum SignatureLeaf {
    ECDSASignature(ECDSASignatureLeaf),
    AddressSignature(AddressSignatureLeaf),
    DynamicSignature(DynamicSignatureLeaf),
    NodeSignature(NodeLeaf),
    BranchSignature(BranchLeaf),
    SubdigestSignature(SubdigestLeaf),
    NestedSignature(NestedLeaf),
}

/// The enum representation of a signature leaf type
/// Derived from: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L102
/// License: Apache-2.0
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[repr(u8)]
pub enum SignatureLeafType {
    ECDSASignature = 0,
    Address = 1,
    DynamicSignature = 2,
    Node = 3,
    Branch = 4,
    Subdigest = 5,
    Nested = 6,
}

/// The struct representation of an ECDSA signature leaf type
/// Derived from: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/utils/SignatureValidator.sol#L83
/// License: Apache-2.0
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[repr(u8)]
pub enum ECDSASignatureType {
    ECDSASignatureTypeEIP712 = 1,
    ECDSASignatureTypeEthSign = 2,
}

/// The constant length of an ECDSA signature
/// The actual length of the signature is 65 bytes
/// Internally, the original length is + 1 byte for the signature type
pub const ECDSA_SIGNATURE_LENGTH: usize = 65;

pub const ERC1271_MAGICVALUE_BYTES32: [u8; 4] = [22, 38, 186, 126];

#[derive(Clone, PartialEq)]
pub struct ECDSASignature(pub [u8; ECDSA_SIGNATURE_LENGTH]);

impl From<&str> for ECDSASignature {
    fn from(s: &str) -> Self {
        let vec = hex::decode(s).expect("Decoding failed");
        let mut arr = [0u8; ECDSA_SIGNATURE_LENGTH];
        arr.copy_from_slice(vec.as_slice());
        ECDSASignature(arr)
    }
}

#[serde_as]
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct ECDSASignatureLeaf {
    pub address: Address,
    pub signature_type: ECDSASignatureType,
    pub signature: ECDSASignature,
}

impl From<&ECDSASignatureLeaf> for Vec<u8> {
    fn from(item: &ECDSASignatureLeaf) -> Self {
        // Concatenate the signature and signature type
        let mut signature = item.clone().signature.0.to_vec();
        // Insert type at end
        signature.push(item.clone().signature_type as u8);

        signature
    }
}

#[serde_as]
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct AddressSignatureLeaf {
    pub address: Address,
}

impl From<&AddressSignatureLeaf> for Vec<u8> {
    fn from(item: &AddressSignatureLeaf) -> Self {
        item.clone().address.0.to_vec()
    }
}

/// The struct representation of a Dynamic signature leaf type
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[repr(u8)]
pub enum DynamicSignatureType {
    DynamicSignatureTypeEIP712 = 1,
    DynamicSignatureTypeEthSign = 2,
    DynamicSignatureTypeEIP1271 = 3,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct DynamicSignatureLeaf {
    pub address: Address,
    pub signature_type: DynamicSignatureType,
    pub signature: Signature,
    pub size: u32,
}

impl From<&DynamicSignatureLeaf> for Vec<u8> {
    fn from(item: &DynamicSignatureLeaf) -> Self {
        // Push the address
        let mut signature = item.clone().address.0.to_vec();

        // Push the size (Vec<u8>) to the end of the signature
        // Not that the size is a solidity uint24, but we use u32 here, so we need to truncate
        // the first byte
        let mut size = item.clone().size.to_be_bytes().to_vec();
        size.remove(0);
        signature.extend_from_slice(&size);

        // Concatenate the signature and signature type
        signature.extend_from_slice(&item.clone().signature.0.to_vec());
        // Insert type at end
        signature.push(item.clone().signature_type as u8);

        signature
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct NodeLeaf {
    pub hash: B256,
}

impl From<&NodeLeaf> for Vec<u8> {
    fn from(item: &NodeLeaf) -> Self {
        item.clone().hash.0.to_vec()
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct BranchLeaf {
    pub size: u32,
}

impl From<&BranchLeaf> for Vec<u8> {
    fn from(item: &BranchLeaf) -> Self {
        // Push the size (Vec<u8>) to the end of the signature
        // Not that the size is a solidity uint24, but we use u32 here, so we need to truncate
        // the first byte
        let mut size = item.clone().size.to_be_bytes().to_vec();
        size.remove(0);
        size
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct SubdigestLeaf {
    pub hash: B256,
}

impl From<&SubdigestLeaf> for Vec<u8> {
    fn from(item: &SubdigestLeaf) -> Self {
        item.clone().hash.0.to_vec()
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct NestedLeaf {
    pub internal_threshold: u16,
    pub external_weight: u8,
    pub internal_root: B256,
    pub size: u32,
}

impl From<&NestedLeaf> for Vec<u8> {
    fn from(item: &NestedLeaf) -> Self {
        // Concatenate the signature and signature type
        let mut signature = vec![item.clone().external_weight];
        // Push the internal threshold (Vec<u8>) to the end of the signature
        signature.extend_from_slice(&item.clone().internal_threshold.to_be_bytes());
        // Push the size (Vec<u8>) to the end of the signature
        // Not that the size is a solidity uint24, but we use u32 here, so we need to truncate
        // the first byte
        let mut size = item.clone().size.to_be_bytes().to_vec();
        size.remove(0);
        signature.extend_from_slice(&size);

        signature
    }
}

impl Signature {
    pub fn len(&self) -> usize {
        let Signature(inner) = self;
        inner.len()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn as_slice(&self) -> &[u8] {
        let Signature(inner) = self;
        inner.as_slice()
    }
}

impl std::fmt::Debug for Signature {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "0x{}", hex::encode(self.as_slice()))
    }
}

impl From<Vec<u8>> for Signature {
    fn from(bytes: Vec<u8>) -> Self {
        Signature(bytes)
    }
}

impl std::fmt::Debug for ECDSASignature {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "0x{}", hex::encode(self.0))
    }
}

impl From<[u8; ECDSA_SIGNATURE_LENGTH]> for ECDSASignature {
    fn from(item: [u8; ECDSA_SIGNATURE_LENGTH]) -> Self {
        ECDSASignature(item)
    }
}

impl TryFrom<Vec<u8>> for ECDSASignature {
    type Error = &'static str;

    fn try_from(bytes: Vec<u8>) -> Result<Self, Self::Error> {
        if bytes.len() != ECDSA_SIGNATURE_LENGTH {
            return Err("Invalid length for ECDSASignature");
        }

        let mut array = [0u8; ECDSA_SIGNATURE_LENGTH];
        for (place, element) in array.iter_mut().zip(bytes.iter()) {
            *place = *element;
        }
        Ok(ECDSASignature(array))
    }
}

impl Serialize for ECDSASignature {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let hex_string = format!("0x{}", hex::encode(self.0));
        serializer.serialize_str(&hex_string)
    }
}

struct ECDSASignatureVisitor;

impl<'de> Visitor<'de> for ECDSASignatureVisitor {
    type Value = ECDSASignature;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("a string starts with 0x followed by 260 hexadecimal characters")
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        if !value.starts_with("0x") {
            return Err(E::custom("Expected string to start with '0x'"));
        }
        let bytes = hex::decode(&value[2..]).map_err(de::Error::custom)?;
        if bytes.len() != ECDSA_SIGNATURE_LENGTH {
            return Err(E::custom("Expected 65 bytes"));
        }
        let mut array = [0u8; ECDSA_SIGNATURE_LENGTH];
        array.copy_from_slice(&bytes);
        Ok(ECDSASignature(array))
    }
}

impl<'de> Deserialize<'de> for ECDSASignature {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_str(ECDSASignatureVisitor)
    }
}

struct SignatureVisitor;

impl<'de> Visitor<'de> for SignatureVisitor {
    type Value = Signature;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("a string starts with 0x followed by hexadecimal characters")
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        if !value.starts_with("0x") {
            return Err(E::custom("Expected string to start with '0x'"));
        }
        let bytes = hex::decode(&value[2..]).map_err(de::Error::custom)?;
        Ok(Signature(bytes))
    }
}

impl<'de> Deserialize<'de> for Signature {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_str(SignatureVisitor)
    }
}

impl Serialize for Signature {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let hex_string = format!("0x{}", hex::encode(self.0.as_slice()));
        serializer.serialize_str(&hex_string)
    }
}
