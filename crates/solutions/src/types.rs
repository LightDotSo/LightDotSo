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
    types::{Address, H256},
    utils::hex,
};
use serde::{
    de::{self, Visitor},
    Deserialize, Deserializer, Serialize, Serializer,
};
use serde_with::serde_as;
use std::convert::TryFrom;

#[derive(Clone, Debug, PartialEq)]
pub struct Signature(pub Vec<u8>);

/// The struct representation of a wallet signer
/// Derived from: https://github.com/0xsequence/go-sequence/blob/eabca0c348b5d87dd943a551908c80f61c347899/config.go#L17
/// License: Apache-2.0
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Signer {
    pub weight: u8,
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

/// The struct representation of a wallet config
/// Derived from: https://github.com/0xsequence/go-sequence/blob/eabca0c348b5d87dd943a551908c80f61c347899/config.go#L12
/// License: Apache-2.0
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct WalletConfig {
    // Bytes32 hash of the checkpoint
    pub checkpoint: u32,
    // Uint16 threshold
    pub threshold: u16,
    // Uint256 weight of the retured signature
    pub weight: usize,
    // Image hash of the wallet config that is used to verify the wallet
    pub image_hash: H256,
    // Signers of the wallet
    pub tree: SignerNode,
    // Internal field used to store the image hash of the wallet config
    #[serde(skip_serializing_if = "Option::is_none")]
    pub internal_root: Option<H256>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
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

#[derive(Clone, Debug, PartialEq)]
pub struct ECDSASignature(pub [u8; ECDSA_SIGNATURE_LENGTH]);

#[serde_as]
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct ECDSASignatureLeaf {
    pub address: Address,
    pub signature_type: ECDSASignatureType,
    pub signature: ECDSASignature,
}

#[serde_as]
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct AddressSignatureLeaf {
    pub address: Address,
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
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct NodeLeaf {}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct BranchLeaf {}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct SubdigestLeaf {}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct NestedLeaf {
    pub internal_threshold: u16,
    pub external_weight: u8,
    pub address: Address,
    pub internal_root: H256,
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

impl From<Vec<u8>> for Signature {
    fn from(bytes: Vec<u8>) -> Self {
        Signature(bytes)
    }
}

impl From<[u8; ECDSA_SIGNATURE_LENGTH]> for ECDSASignature {
    fn from(item: [u8; ECDSA_SIGNATURE_LENGTH]) -> Self {
        ECDSASignature(item)
    }
}

impl TryFrom<Vec<u8>> for ECDSASignature {
    type Error = &'static str; // You can use a more specific error type here

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
