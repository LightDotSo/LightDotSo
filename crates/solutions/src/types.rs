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

use ethers::types::Address;

pub type Signature = Vec<u8>;

/// The struct representation of a wallet signer
/// Derived from: https://github.com/0xsequence/go-sequence/blob/eabca0c348b5d87dd943a551908c80f61c347899/config.go#L17
/// License: Apache-2.0
#[derive(Debug)]
pub struct Signer {
    pub weight: u8,
    pub address: Address,
}

/// The struct representation of a wallet config
/// Derived from: https://github.com/0xsequence/go-sequence/blob/eabca0c348b5d87dd943a551908c80f61c347899/config.go#L12
/// License: Apache-2.0
#[derive(Debug)]
pub struct WalletConfig {
    // Bytes32 hash of the checkpoint
    pub checkpoint: [u8; 32],
    // Uint16 threshold
    pub threshold: u16,
    // Uint256 weight
    pub weight: u16,
    // Image hash of the wallet config
    pub image_hash: [u8; 32],
    // Signers of the wallet
    pub signers: Vec<Signer>,
}

/// The enum representation of a signature leaf type
/// Derived from: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L102
/// License: Apache-2.0
#[derive(Debug)]
#[repr(u8)]
pub enum SignatureLeafType {
    SignatureLeafTypeAddress = 0,
    SignatureLeafTypeECDSASignature = 1,
    SignatureLeafTypeDynamicSignature = 2,
    SignatureLeafTypeNode = 3,
    SignatureLeafTypeBranch = 4,
    SignatureLeafTypeNested = 5,
    SignatureLeafTypeSubdigest = 6,
}

/// The struct representation of an ECDSA signature leaf type
/// Derived from: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/utils/SignatureValidator.sol#L83
/// License: Apache-2.0
#[derive(Debug, PartialEq)]
#[repr(u8)]
pub enum ECDSASignatureType {
    ECDSASignatureTypeEIP712 = 1,
    ECDSASignatureTypeEthSign = 2,
}

/// The constant length of an ECDSA signature
/// The length of the signature is 64 bytes + 1 byte for the signature type
/// Add 1 byte for the signature type
pub const ECDSA_SIGNATURE_LENGTH: usize = 64;

#[derive(Debug, PartialEq)]
pub struct SignatureTreeECDSASignatureLeaf {
    pub address: Address,
    pub signature_type: ECDSASignatureType,
    pub signature: [u8; ECDSA_SIGNATURE_LENGTH],
}

/// The struct representation of a Dynamic signature leaf type
#[derive(Debug, PartialEq)]
#[repr(u8)]
pub enum DynamicSignatureType {
    DynamicSignatureTypeEIP712 = 1,
    DynamicSignatureTypeEthSign = 2,
    DynamicSignatureTypeEIP1271 = 3,
}

#[derive(Debug, PartialEq)]
pub struct SignatureTreeDynamicSignatureLeaf {
    // pub weight: u8,
    pub address: Address,
    pub signature_type: DynamicSignatureType,
    pub signature: Vec<u8>,
}
