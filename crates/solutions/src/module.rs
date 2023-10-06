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

use crate::{
    signature::{recover_dynamic_signature, recover_ecdsa_signature},
    traits::IsZero,
    types::{Signature, WalletConfig},
    utils::{
        hash_keccak_256, left_pad_u16_to_bytes32, left_pad_u64_to_bytes32, read_bytes32,
        read_uint16, read_uint24, read_uint32, read_uint8, read_uint8_address,
    },
};
use async_recursion::async_recursion;
use ethers::{
    abi::{encode, encode_packed, Token},
    types::{Address, U256},
    utils::keccak256,
};
use eyre::{eyre, Result};

pub(crate) struct SigModule {
    address: Address,
    chain_id: u64,
    rindex: usize,
    subdigest: [u8; 32],
    root: [u8; 32],
    sig: Signature,
    weight: u64,
}

impl SigModule {
    /// Initializes a new SigModule
    pub fn new(address: Address, chain_id: u64, subdigest: [u8; 32]) -> Self {
        Self { address, subdigest, rindex: 0, root: [0; 32], sig: vec![], weight: 0, chain_id }
    }

    /// Initializes a new empty SigModule
    #[allow(dead_code)]
    pub fn empty() -> Self {
        Self::new(Address::zero(), 1, [0; 32])
    }

    #[allow(dead_code)]
    pub fn set_address(&mut self, address: Address) -> &mut Self {
        self.address = address;
        self
    }

    #[allow(dead_code)]
    pub fn set_chain_id(&mut self, chain_id: u64) -> &mut Self {
        self.chain_id = chain_id;
        self
    }

    pub fn set_signature(&mut self, sig: Signature) -> &mut Self {
        self.sig = sig;
        self
    }

    #[allow(dead_code)]
    pub fn set_weight(&mut self, weight: u64) -> &mut Self {
        self.weight = weight;
        self
    }

    /// Returns the subdigest of the signature
    pub fn get_subdigest(&self, digest: [u8; 32]) -> [u8; 32] {
        keccak256(
            encode_packed(&[
                Token::String("\x19\x01".to_string()),
                Token::FixedBytes(left_pad_u64_to_bytes32(self.chain_id).to_vec()),
                Token::Address(self.address),
                Token::FixedBytes(digest.to_vec()),
            ])
            .unwrap(),
        )
    }

    /// Sets the subdigest w/ the digest function
    #[allow(dead_code)]
    pub fn set_subdigest(&mut self, digest: [u8; 32]) {
        self.subdigest = self.get_subdigest(digest)
    }

    /// Sets the subdigest directly (bypassing digest function))
    pub fn set_subdigest_direct(&mut self, digest: [u8; 32]) {
        self.subdigest = digest
    }

    /// Sets the root of the merkle tree
    pub fn return_valid_root(&mut self, node: [u8; 32]) {
        self.root = if !self.root.is_zero() { hash_keccak_256(self.root, node) } else { node };
    }

    /// Generates a leaf node for the merkle tree
    fn leaf_for_address_and_weight(&self, addr: Address, weight: u8) -> [u8; 32] {
        let weight_shifted = U256::from(weight) << 160;
        let addr_u256 = U256::from_big_endian(addr.as_bytes());
        (weight_shifted | addr_u256).into()
    }

    /// Recovers the wallet config from the signature
    fn leaf_for_nested(&self, internal_root: [u8; 32], internal_threshold: u16) -> [u8; 32] {
        keccak256(
            encode_packed(&[
                Token::String("Sequence nested config:\n".to_string()),
                Token::FixedBytes(internal_root.to_vec()),
                Token::FixedBytes(left_pad_u16_to_bytes32(internal_threshold).to_vec()),
                Token::FixedBytes(left_pad_u64_to_bytes32(self.weight).to_vec()),
            ])
            .unwrap(),
        )
    }

    /// Recovers the wallet config from the signature
    fn leaf_for_hardcoded_subdigest(&self, hardcoded_subdigest: [u8; 32]) -> [u8; 32] {
        keccak256(
            encode_packed(&[
                Token::String("Sequence static digest:\n".to_string()),
                Token::FixedBytes(hardcoded_subdigest.to_vec()),
            ])
            .unwrap(),
        )
    }
    /// Decodes an ECDSA signature
    fn decode_ecdsa_signature(&mut self) -> Result<()> {
        let (addr_weight, rindex) = read_uint8(&self.sig, self.rindex)?;

        let nrindex = rindex + 66;
        let signature_type = recover_ecdsa_signature(&self.sig, &self.subdigest, rindex)?;
        self.rindex = nrindex;

        self.weight += addr_weight as u64;

        let node = self.leaf_for_address_and_weight(signature_type.address, addr_weight);
        self.return_valid_root(node);

        Ok(())
    }

    /// Decodes an address signature
    fn decode_address_signature(&mut self) -> Result<()> {
        let (addr_weight, addr, rindex) = read_uint8_address(&self.sig, self.rindex)?;

        self.rindex = rindex;
        let node = self.leaf_for_address_and_weight(addr, addr_weight);
        self.return_valid_root(node);

        Ok(())
    }

    /// Decodes a dynamic signature
    async fn decode_dynamic_signature(&mut self) -> Result<()> {
        let (addr_weight, addr, rindex) = read_uint8_address(&self.sig, self.rindex)?;

        // Read signature size
        let (size, rindex) = read_uint16(&self.sig, rindex)?;

        let nrindex = rindex + size as usize;
        recover_dynamic_signature(self.chain_id, &self.sig, &self.subdigest, addr, rindex, nrindex)
            .await?;
        self.rindex = nrindex;

        self.weight += addr_weight as u64;

        let node = self.leaf_for_address_and_weight(addr, addr_weight);
        self.return_valid_root(node);

        Ok(())
    }

    /// Decodes a node signature
    fn decode_node_signature(&mut self) -> Result<()> {
        let (node, rindex) = read_bytes32(&self.sig, self.rindex)?;
        self.return_valid_root(node);
        self.rindex = rindex;

        Ok(())
    }

    /// Decodes a branch signature
    #[async_recursion]
    async fn decode_branch_signature(&mut self) -> Result<()> {
        // Read signature size
        let (size, rindex) = read_uint24(&self.sig, self.rindex)?;
        let nrindex = rindex + size as usize;

        let mut base_sig_module = SigModule::new(self.address, self.chain_id, self.subdigest);
        base_sig_module.set_signature(self.sig[rindex..nrindex].to_vec());
        let (nweight, node) = base_sig_module.recover_branch().await?;

        self.weight += nweight as u64;
        self.root = hash_keccak_256(self.root, node);
        self.rindex = nrindex;

        Ok(())
    }

    /// Decodes a digest signature
    fn decode_digest_signature(&mut self) -> Result<()> {
        let (hardcoded, _rindex) = read_bytes32(&self.sig, self.rindex)?;
        if hardcoded == self.subdigest {
            self.weight = u64::MAX;
        }

        let node = self.leaf_for_hardcoded_subdigest(hardcoded);
        self.return_valid_root(node);

        Ok(())
    }

    /// Decodes a nested signature
    #[async_recursion]
    async fn decode_nested_signature(&mut self) -> Result<()> {
        let (external_weight, rindex) = read_uint8(&self.sig, self.rindex)?;

        let (internal_threshold, rindex) = read_uint16(&self.sig, rindex)?;

        let (size, rindex) = read_uint24(&self.sig, rindex)?;
        let nrindex = rindex + size as usize;

        let mut base_sig_module = SigModule::new(self.address, self.chain_id, self.subdigest);
        base_sig_module.set_signature(self.sig[rindex..nrindex].to_vec());
        let (internal_weight, internal_root) = base_sig_module.recover_branch().await?;
        self.rindex = nrindex;

        if (internal_weight as u16) >= internal_threshold {
            self.weight += external_weight as u64;
        }

        let node = self.leaf_for_nested(internal_root, internal_threshold);
        self.return_valid_root(node);

        Ok(())
    }

    /// Recovers the branch of the merkle tree
    async fn recover_branch(&mut self) -> Result<(usize, [u8; 32])> {
        let s = self.sig.len();

        // Iterating over the signature while length is greater than 0
        while self.rindex < s {
            // Get the first byte of the signature
            let (flag, rindex) = read_uint8(&self.sig, self.rindex)?;
            self.rindex = rindex;

            match flag {
                0 => self.decode_ecdsa_signature()?,
                1 => self.decode_address_signature()?,
                2 => self.decode_dynamic_signature().await?,
                3 => self.decode_node_signature()?,
                4 => self.decode_branch_signature().await?,
                5 => self.decode_digest_signature()?,
                6 => self.decode_nested_signature().await?,
                _ => return Err(eyre!("Invalid signature flag")),
            }
        }

        Ok((self.weight as usize, self.root))
    }

    /// Recovers the threshold and checkpoint from the signature
    fn recover_threshold_checkpoint(&self) -> Result<(u16, u32)> {
        let s = self.sig.len();

        // If the length is lees than 2 bytes, it's an invalid signature
        if s < 2 {
            return Err(eyre!("Invalid signature"));
        }

        // Threshold is the first two bytes of the signature
        // Hex: 0x0000 ~ 0xFFFF
        // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L269C9-L269C9
        // License: Apache-2.0
        let threshold = u16::from_be_bytes([self.sig[0], self.sig[1]]);

        // If the length is less than 34 bytes, it doesn't have a checkpoint
        if s < 34 {
            return Ok((threshold, 0));
        }

        // Checkpoint is the next 32 bytes of the signature
        // Hex: 0x00000000
        // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L270C7-L270C17
        // License: Apache-2.0
        let (checkpoint, _) = read_uint32(&self.sig, 2)?;

        Ok((threshold, checkpoint))
    }

    /// Recovers the wallet config from the signature
    pub(crate) async fn recover(&mut self) -> Result<WalletConfig> {
        // Get the threshold and checkpoint from the signature
        let (threshold, checkpoint) = self.recover_threshold_checkpoint()?;

        // Trim the signature to remove the threshold and checkpoint
        self.sig = self.sig[6..].to_vec();

        // If the length is greater than 34 bytes, it's a branch signature
        let (weight, digest) = self.recover_branch().await?;
        let image_hash = keccak256(encode(&[
            Token::FixedBytes(
                keccak256(encode(&[
                    Token::FixedBytes(digest.to_vec()),
                    Token::Uint(U256::from(threshold)),
                ]))
                .to_vec(),
            ),
            Token::Uint(U256::from(checkpoint)),
        ]));

        Ok(WalletConfig { threshold, checkpoint, image_hash, weight, signers: vec![] })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::utils::{from_hex_string, parse_hex_to_bytes32, print_hex_string, to_hex_string};
    use ethers::core::types::Address;

    #[test]
    fn test_print_hex_string() {
        let test_bytes: [u8; 4] = [0x11, 0x22, 0x33, 0x44];
        let expected_output = "0x11223344";

        let result = to_hex_string(&test_bytes);
        print_hex_string(&test_bytes);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_leaf_for_address_and_weight() {
        let base_sig_module = SigModule::empty();
        let test_addr = "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse::<Address>().unwrap();
        let test_weight = 1;
        let expected_output = parse_hex_to_bytes32(
            "0x0000000000000000000000014fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed",
        )
        .unwrap();

        let result = base_sig_module.leaf_for_address_and_weight(test_addr, test_weight);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_leaf_for_nested() {
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_weight(1);

        let test_node = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let test_threshold = 1;
        let expected_output = parse_hex_to_bytes32(
            "0x907152f3fb1d245b378d4a00af6de7e68f3458fdfbeab39db0e2fb84c676e449",
        )
        .unwrap();

        let result = base_sig_module.leaf_for_nested(test_node, test_threshold);
        println!("{:?}", result);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_leaf_for_hardcoded_subdigest() {
        let base_sig_module = SigModule::empty();
        let test_hardcoded_digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let expected_output = parse_hex_to_bytes32(
            "0x1773e5bd11cd42e98b2e68005291627c91f4554148dd1a0e3941a681d892b516",
        )
        .unwrap();

        let result = base_sig_module.leaf_for_hardcoded_subdigest(test_hardcoded_digest);

        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_get_subdigest() {
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_chain_id(1);
        base_sig_module.set_address("0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f".parse().unwrap());

        let digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();

        let res = base_sig_module.get_subdigest(digest);

        let expected = parse_hex_to_bytes32(
            "0x349298d2e05ff7da41925abdea9f3453feada8ea0b96bac074d14609ce004ded",
        )
        .unwrap();

        assert_eq!(res, expected);
    }

    #[test]
    fn test_base_recover_threshold() {
        let mut base_sig_module = SigModule::empty();
        base_sig_module.sig = vec![0x11, 0x11];

        let res = base_sig_module.recover_threshold_checkpoint().unwrap();
        assert!(res.0 == 4369);
    }

    #[test]
    fn test_base_recover_checkpoint() {
        let mut base_sig_module = SigModule::empty();
        base_sig_module.sig = Iterator::collect::<Vec<u8>>([1; 34].iter().copied());

        let res = base_sig_module.recover_threshold_checkpoint().unwrap();

        assert_eq!(res.0, 257);
        assert_eq!(res.1, 16843009);
    }

    #[tokio::test]
    async fn test_recover_branch_empty() {
        let subdigest = parse_hex_to_bytes32(
            "0x92d0f634e827762fce47af292092b09b54754ad27bd2ad2c079a0edf9ab9b007",
        )
        .unwrap();

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        let empty_node_sig=
            // 3u8 is the signature type for a node signature
            encode_packed(&[Token::Uint(3u8.into()), Token::FixedBytes([0u8; 32].to_vec())])
                .unwrap();

        base_sig_module.set_signature(empty_node_sig.clone());

        let (weight, root) = base_sig_module.recover_branch().await.unwrap();
        assert_eq!(weight, 0);
        assert_eq!(root, [0; 32]);
    }

    #[tokio::test]
    async fn test_recover_fail_empty() {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000002b45",
        )
        .unwrap();

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        let empty_sig = vec![];
        base_sig_module.set_signature(empty_sig);

        let expected_err = eyre!("Invalid signature");

        let res = base_sig_module.recover().await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
        println!("{:?}", res);
    }

    #[tokio::test]
    async fn test_recover_branch_empty_signature() {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000002b45",
        )
        .unwrap();

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        let empty_sig = vec![];
        base_sig_module.set_signature(empty_sig);

        let (weight, root) = base_sig_module.recover_branch().await.unwrap();
        assert_eq!(weight, 0);
        assert_eq!(root, [0; 32]);
    }

    #[tokio::test]
    async fn test_recover_branch_fail_invalid_flag() {
        let mut base_sig_module = SigModule::empty();
        let empty_node_sig=
            // 9u8 is an invalid signature type
            encode_packed(&[Token::Uint(9u8.into()), Token::FixedBytes([0u8; 32].to_vec())])
                .unwrap();

        base_sig_module.set_signature(empty_node_sig.clone());

        let expected_err = eyre!("Invalid signature flag");

        let res = base_sig_module.recover_branch().await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
    }

    #[tokio::test]
    async fn test_recover_branch_signature() {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let sig_str = "0x00606673ffad2147741f04772b6f921f0ba6af0c1e77fc439e65c36dedf4092e88984c1a971652e0ada880120ef8025e709fff2080c4a39aae068d12eed009b68c891c01";
        let sig = from_hex_string(sig_str).unwrap();

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig);

        let expected_root = parse_hex_to_bytes32(
            "0x0000000000000000000000607e5f4552091a69125d5dfcb7b8c2659029395bdf",
        )
        .unwrap();

        let config = base_sig_module.recover_branch().await.unwrap();
        assert_eq!(config.0, 96);
        assert_eq!(config.1, expected_root)
    }

    #[tokio::test]
    async fn test_recover_branch_address() {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let sig_str = "0x01080000000000000000000000000000000000000001";

        let sig = from_hex_string(sig_str).unwrap();
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig);
        base_sig_module.set_weight(8);

        let expected_root = parse_hex_to_bytes32(
            "0x0000000000000000000000080000000000000000000000000000000000000001",
        )
        .unwrap();

        let config = base_sig_module.recover_branch().await.unwrap();
        assert_eq!(config.0, 8);
        assert_eq!(config.1, expected_root)
    }

    #[tokio::test]
    async fn test_recover_branch_node() {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();
        let sig_str = "0x0300000000000000000000000000000000000000000000000000000000deadbeef";

        let sig = from_hex_string(sig_str).unwrap();
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig);

        let expected_root = parse_hex_to_bytes32(
            "0x00000000000000000000000000000000000000000000000000000000deadbeef",
        )
        .unwrap();

        let config = base_sig_module.recover_branch().await.unwrap();
        assert_eq!(config.0, 0);
        assert_eq!(config.1, expected_root)
    }

    #[tokio::test]
    async fn test_recover_simple() {
        let subdigest = parse_hex_to_bytes32(
            "0x21c816235ccd179f03e4027691a68a7f70387fdd70cef9dba02a39ffba192856",
        )
        .unwrap();
        let sig_str = "0x00110000000000025381b31277854cdcbf3feba4366454231d6f938c714464fb6a5ab564d6fe5fc76b8fb4513c4eda90e96c2cf7586bdfb25f55dcea82146288781d1cf82b95d9771b01";

        let sig = from_hex_string(sig_str).unwrap();
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig);

        let expected_root = parse_hex_to_bytes32(
            "0x50ec12b237887c47767742e6425b98694ac9f793a31729766ea4748b382ea648",
        )
        .unwrap();

        let config = base_sig_module.recover().await.unwrap();
        assert_eq!(config.threshold, 17);
        assert_eq!(config.checkpoint, 0);
        assert_eq!(config.weight, 2);
        assert_eq!(config.image_hash, expected_root);
    }
}
