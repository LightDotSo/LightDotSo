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

use crate::{
    config::WalletConfig,
    node::{leaf_for_address_and_weight, leaf_for_hardcoded_subdigest, leaf_for_nested},
    signature::{recover_dynamic_signature, recover_ecdsa_signature},
    types::{
        AddressSignatureLeaf, BranchLeaf, NestedLeaf, NodeLeaf, Signature, SignatureLeaf, Signer,
        SignerNode, SubdigestLeaf,
    },
    utils::{
        hash_keccak_256, left_pad_u16_to_bytes32, left_pad_u32_to_bytes32, read_bytes32,
        read_uint16, read_uint24, read_uint32, read_uint8, read_uint8_address, render_subdigest,
    },
};
use alloy::{
    dyn_abi::DynSolValue,
    primitives::{keccak256, Address, FixedBytes, U256},
};
use async_recursion::async_recursion;
use eyre::{eyre, Result};
use lightdotso_common::traits::IsZero;

#[derive(Clone, Debug)]
pub struct SigModule {
    /// The address of the wallet
    pub address: Address,
    /// The chain id of the network
    pub chain_id: u64,
    /// The index position of the signature
    rindex: usize,
    /// The subdigest used as the message of the signature
    pub subdigest: [u8; 32],
    /// The root of the merkle tree (will get updated as the signature is decoded)
    root: [u8; 32],
    /// The signature in bytes
    pub sig: Signature,
    /// The cumulative weight of the signature
    weight: u64,
    /// The internal tree of the module
    pub tree: SignerNode,
}

impl SigModule {
    /// Initializes a new SigModule
    pub fn new(
        address: Address,
        chain_id: u64,
        subdigest: [u8; 32],
        tree: Option<SignerNode>,
    ) -> Self {
        Self {
            address,
            subdigest,
            rindex: 0,
            root: [0; 32],
            sig: vec![].into(),
            weight: 0,
            chain_id,
            tree: tree.unwrap_or_else(|| SignerNode { signer: None, left: None, right: None }),
        }
    }

    /// Initializes a new empty SigModule
    #[allow(dead_code)]
    pub fn empty() -> Self {
        Self::new(Address::ZERO, 1, [0; 32], None)
    }

    /// Sets the address of the wallet
    #[allow(dead_code)]
    pub fn set_address(&mut self, address: Address) -> &mut Self {
        self.address = address;
        self
    }

    /// Sets the chain id of the network
    #[allow(dead_code)]
    pub fn set_chain_id(&mut self, chain_id: u64) -> &mut Self {
        self.chain_id = chain_id;
        self
    }

    /// Sets the signature
    pub fn set_signature(&mut self, sig: Signature) -> &mut Self {
        self.sig = sig;
        self
    }

    /// Sets the tree of the signature
    pub fn set_tree(&mut self, tree: SignerNode) -> &mut Self {
        self.tree = tree;
        self
    }

    /// Sets the weight of the signature
    #[allow(dead_code)]
    pub fn set_weight(&mut self, weight: u64) -> &mut Self {
        self.weight = weight;
        self
    }

    /// Returns the subdigest of the signature
    pub fn get_subdigest(&self, digest: [u8; 32]) -> Result<[u8; 32]> {
        render_subdigest(self.chain_id, self.address, digest)
    }

    /// Sets the subdigest w/ the digest function
    pub fn set_subdigest(&mut self) -> Result<()> {
        self.subdigest = self.get_subdigest(self.subdigest)?;

        Ok(())
    }

    /// Sets the subdigest directly (bypassing digest function))
    pub fn set_subdigest_direct(&mut self, digest: [u8; 32]) {
        self.subdigest = digest
    }

    /// Sets the root of the merkle tree
    pub fn return_valid_root(&mut self, node: [u8; 32]) {
        self.root = if !self.root.is_zero() { hash_keccak_256(self.root, node) } else { node };
    }

    /// Injects a signer node into the tree
    fn inject_signer_node(
        &mut self,
        signer_node: SignerNode,
        branch_signer: Option<Signer>,
    ) -> Result<()> {
        let node = Some(Box::new(signer_node));

        // If the tree is empty, set the signer
        if (self.tree.signer.is_none()) && (self.tree.left.is_none()) && (self.tree.right.is_none())
        {
            self.tree.left = node;
            return Ok(());
        }

        // If the right node is empty, move the left node to the left, and set the node to the right
        if self.tree.right.is_none() {
            if let Some(left_tree) = self.tree.clone().left {
                self.tree.left = Some(Box::new(SignerNode {
                    signer: left_tree.signer,
                    left: None,
                    right: None,
                }));
            }

            self.tree.right = node;
            self.tree.signer = branch_signer;
            return Ok(());
        }

        // Push the current tree to the left, and set the node to the right
        self.tree = SignerNode {
            signer: branch_signer,
            left: Some(Box::new(SignerNode {
                signer: self.tree.signer.clone(),
                left: self.tree.left.clone(),
                right: self.tree.right.clone(),
            })),
            right: node,
        };

        Ok(())
    }

    /// Decodes an ECDSA signature
    fn decode_ecdsa_signature(&mut self) -> Result<()> {
        let (addr_weight, rindex) = read_uint8(self.sig.as_slice(), self.rindex)?;

        let nrindex = rindex + 66;
        let signature_leaf = recover_ecdsa_signature(self.sig.as_slice(), &self.subdigest, rindex)?;
        self.rindex = nrindex;

        self.weight += addr_weight as u64;

        let signer = Signer {
            weight: Some(addr_weight),
            leaf: SignatureLeaf::ECDSASignature(signature_leaf.clone()),
        };
        let signer_node = SignerNode { signer: Some(signer.clone()), left: None, right: None };
        self.inject_signer_node(signer_node, None)?;

        let node = leaf_for_address_and_weight(signature_leaf.address, addr_weight)?;
        self.return_valid_root(node);

        Ok(())
    }

    /// Decodes an address signature
    fn decode_address_signature(&mut self) -> Result<()> {
        let (addr_weight, addr, rindex) = read_uint8_address(self.sig.as_slice(), self.rindex)?;

        let signer = Signer {
            weight: Some(addr_weight),
            leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf { address: addr }),
        };
        let signer_node = SignerNode { signer: Some(signer.clone()), left: None, right: None };
        self.inject_signer_node(signer_node, None)?;

        self.rindex = rindex;
        let node = leaf_for_address_and_weight(addr, addr_weight)?;
        self.return_valid_root(node);

        Ok(())
    }

    /// Decodes a dynamic signature
    async fn decode_dynamic_signature(&mut self) -> Result<()> {
        let (addr_weight, addr, rindex) = read_uint8_address(self.sig.as_slice(), self.rindex)?;

        // Read signature size
        let (size, rindex) = read_uint24(self.sig.as_slice(), rindex)?;
        let nrindex = rindex + size as usize;

        let leaf = recover_dynamic_signature(
            self.chain_id,
            self.sig.as_slice(),
            &self.subdigest,
            addr,
            rindex,
            nrindex,
        )
        .await?;
        self.rindex = nrindex;
        self.weight += addr_weight as u64;

        let signer =
            Signer { weight: Some(addr_weight), leaf: SignatureLeaf::DynamicSignature(leaf) };
        let signer_node = SignerNode { signer: Some(signer.clone()), left: None, right: None };
        self.inject_signer_node(signer_node, None)?;

        let node = leaf_for_address_and_weight(addr, addr_weight)?;
        self.return_valid_root(node);

        Ok(())
    }

    /// Decodes a node signature
    fn decode_node_signature(&mut self) -> Result<()> {
        let (node, rindex) = read_bytes32(self.sig.as_slice(), self.rindex)?;
        self.return_valid_root(node);
        self.rindex = rindex;

        let signer = Signer {
            weight: None,
            leaf: SignatureLeaf::NodeSignature(NodeLeaf { hash: node.into() }),
        };
        let signer_node = SignerNode { signer: Some(signer.clone()), left: None, right: None };
        self.inject_signer_node(signer_node, None)?;

        Ok(())
    }

    /// Decodes a branch signature
    #[async_recursion]
    async fn decode_branch_signature(&mut self) -> Result<()> {
        // Read signature size
        let (size, rindex) = read_uint24(self.sig.as_slice(), self.rindex)?;
        let nrindex = rindex + size as usize;

        let mut base_sig_module = SigModule::new(self.address, self.chain_id, self.subdigest, None);
        base_sig_module.set_signature(self.sig.as_slice()[rindex..nrindex].to_vec().into());
        let (nweight, node) = base_sig_module.recover_branch().await?;

        self.weight += nweight as u64;
        self.root = hash_keccak_256(self.root, node);
        self.rindex = nrindex;

        let signer_node = base_sig_module.tree;

        let branch_signer = Signer {
            weight: Some(nweight as u8),
            leaf: SignatureLeaf::BranchSignature(BranchLeaf { size }),
        };

        self.inject_signer_node(signer_node, Some(branch_signer))?;

        Ok(())
    }

    /// Decodes a digest signature
    fn decode_digest_signature(&mut self) -> Result<()> {
        let (hardcoded, rindex) = read_bytes32(self.sig.as_slice(), self.rindex)?;
        self.rindex = rindex;
        if hardcoded == self.subdigest {
            self.weight = u64::MAX;
        }

        let node = leaf_for_hardcoded_subdigest(hardcoded)?;
        self.return_valid_root(node);

        let signer = Signer {
            weight: None,
            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf { hash: hardcoded.into() }),
        };
        let signer_node = SignerNode { signer: Some(signer.clone()), left: None, right: None };
        self.inject_signer_node(signer_node, None)?;

        Ok(())
    }

    /// Decodes a nested signature
    #[async_recursion]
    async fn decode_nested_signature(&mut self) -> Result<()> {
        let (external_weight, rindex) = read_uint8(self.sig.as_slice(), self.rindex)?;

        let (internal_threshold, rindex) = read_uint16(self.sig.as_slice(), rindex)?;

        let (size, rindex) = read_uint24(self.sig.as_slice(), rindex)?;
        let nrindex = rindex + size as usize;

        let mut base_sig_module = SigModule::new(self.address, self.chain_id, self.subdigest, None);
        base_sig_module.set_signature(Signature(self.sig.as_slice()[rindex..nrindex].to_vec()));
        let (internal_weight, internal_root) = base_sig_module.recover_branch().await?;
        self.rindex = nrindex;

        if (internal_weight as u16) >= internal_threshold {
            self.weight += external_weight as u64;
        }

        let node = leaf_for_nested(internal_root, internal_threshold, external_weight)?;
        self.return_valid_root(node);

        let signer_node = base_sig_module.tree;
        let nested_signer = Signer {
            weight: Some(external_weight),
            leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                internal_threshold,
                external_weight,
                internal_root: internal_root.into(),
                size,
            }),
        };
        let signer_node =
            SignerNode { signer: None, left: signer_node.left, right: signer_node.right };
        self.inject_signer_node(signer_node, Some(nested_signer))?;

        Ok(())
    }

    pub fn encode_signature(&mut self) -> Result<()> {
        Ok(())
    }

    /// Recovers the branch of the merkle tree
    pub async fn recover_branch(&mut self) -> Result<(usize, [u8; 32])> {
        let s = self.sig.len();

        // Iterating over the signature while length is greater than 0
        while self.rindex < s {
            // Get the first byte of the signature
            let (flag, rindex) = read_uint8(self.sig.as_slice(), self.rindex)?;
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
        let threshold = u16::from_be_bytes([self.sig.as_slice()[0], self.sig.as_slice()[1]]);

        // If the length is less than 34 bytes, it doesn't have a checkpoint
        if s < 34 {
            return Ok((threshold, 0));
        }

        // Checkpoint is the next 32 bytes of the signature
        // Hex: 0x00000000
        // Ref: https://github.com/0xsequence/wallet-contracts/blob/46838284e90baf27cf93b944b056c0b4a64c9733/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L270C7-L270C17
        // License: Apache-2.0
        let (checkpoint, _) = read_uint32(self.sig.as_slice(), 2)?;

        Ok((threshold, checkpoint))
    }

    pub fn get_computed_config(&self, threshold: u16, checkpoint: u32) -> Result<WalletConfig> {
        let internal_root = self.tree.calculate_image_hash_from_node(self.subdigest)?.into();

        Ok(WalletConfig {
            signature_type: 0,
            threshold,
            checkpoint,
            image_hash: [0; 32].into(),
            weight: 0,
            tree: self.tree.clone(),
            internal_root: Some(internal_root),
            internal_recovered_configs: None,
        })
    }

    /// Recovers the wallet config from the signature
    pub async fn recover(&mut self, signature_type: u8) -> Result<WalletConfig> {
        // Get the threshold and checkpoint from the signature
        let (threshold, checkpoint) = self.recover_threshold_checkpoint()?;

        // Trim the signature to remove the threshold and checkpoint
        self.sig = self.sig.as_slice()[6..].to_vec().into();

        // If the length is greater than 34 bytes, it's a branch signature
        let (weight, image_hash) = self.recover_branch().await?;
        let image_hash = keccak256(
            DynSolValue::Tuple(vec![
                DynSolValue::FixedBytes(
                    FixedBytes::from_slice(
                        keccak256(
                            DynSolValue::Tuple(vec![
                                DynSolValue::FixedBytes(
                                    FixedBytes::from_slice(&image_hash),
                                    image_hash.to_vec().len(),
                                ),
                                DynSolValue::Uint(
                                    U256::from_be_bytes(left_pad_u16_to_bytes32(threshold)),
                                    256,
                                ),
                            ])
                            .abi_encode(),
                        )
                        .as_ref(),
                    ),
                    32,
                ),
                DynSolValue::Uint(U256::from_be_bytes(left_pad_u32_to_bytes32(checkpoint)), 256),
            ])
            .abi_encode(),
        );

        // If the tree is single (right is empty), set the tree as root tree signer
        if self.tree.right.is_none() {
            if let Some(left_tree) = self.tree.clone().left {
                self.tree = SignerNode { signer: left_tree.signer, left: None, right: None };
            }
        }
        let tree = self.tree.clone();

        let internal_root = Some(self.tree.calculate_image_hash_from_node(self.subdigest)?.into());

        Ok(WalletConfig {
            signature_type,
            threshold,
            checkpoint,
            image_hash,
            weight: weight as u32,
            tree,
            internal_root,
            internal_recovered_configs: None,
        })
    }
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::utils::{from_hex_string, parse_hex_to_bytes32, print_hex_string, to_hex_string};

    #[test]
    fn test_print_hex_string() -> Result<()> {
        let test_bytes: [u8; 4] = [0x11, 0x22, 0x33, 0x44];
        let expected_output = "0x11223344";

        let result = to_hex_string(&test_bytes);
        print_hex_string(&test_bytes);

        assert_eq!(result, expected_output);

        Ok(())
    }

    #[test]
    fn test_get_subdigest() -> Result<()> {
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_chain_id(1);
        base_sig_module.set_address("0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f".parse()?);

        let digest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;

        let res = base_sig_module.get_subdigest(digest)?;

        let expected = parse_hex_to_bytes32(
            "0x349298d2e05ff7da41925abdea9f3453feada8ea0b96bac074d14609ce004ded",
        )?;

        assert_eq!(res, expected);

        Ok(())
    }

    #[test]
    fn test_base_recover_threshold() -> Result<()> {
        let mut base_sig_module = SigModule::empty();
        base_sig_module.sig = vec![0x11, 0x11].into();

        let res = base_sig_module.recover_threshold_checkpoint()?;
        assert!(res.0 == 4369);

        Ok(())
    }

    #[test]
    fn test_base_recover_checkpoint() -> Result<()> {
        let mut base_sig_module = SigModule::empty();
        base_sig_module.sig = Signature(Iterator::collect::<Vec<u8>>([1; 34].iter().copied()));

        let res = base_sig_module.recover_threshold_checkpoint()?;

        assert_eq!(res.0, 257);
        assert_eq!(res.1, 16843009);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_empty() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x92d0f634e827762fce47af292092b09b54754ad27bd2ad2c079a0edf9ab9b007",
        )?;

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        let empty_node_sig=
            // 3u8 is the signature type for a node signature
            DynSolValue::Tuple(vec![
                DynSolValue::Bytes(vec![3u8; 1]),
                DynSolValue::FixedBytes(FixedBytes::from_slice(&[0u8; 32]), 32),
            ]).abi_encode_packed();

        base_sig_module.set_signature(empty_node_sig.clone().into());

        let (weight, root) = base_sig_module.recover_branch().await?;
        assert_eq!(weight, 0);
        assert_eq!(root, [0; 32]);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_fail_empty() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000002b45",
        )?;

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        let empty_sig = vec![];
        base_sig_module.set_signature(empty_sig.into());

        let expected_err = eyre!("Invalid signature");

        let res = base_sig_module.recover(0).await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());
        println!("{:?}", res);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_empty_signature() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000002b45",
        )?;

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        let empty_sig = vec![];
        base_sig_module.set_signature(empty_sig.into());

        let (weight, root) = base_sig_module.recover_branch().await?;
        assert_eq!(weight, 0);
        assert_eq!(root, [0; 32]);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_fail_invalid_flag() -> Result<()> {
        let mut base_sig_module = SigModule::empty();
        let empty_node_sig=
            // 9u8 is an invalid signature type
            DynSolValue::Tuple(vec![
                DynSolValue::Bytes(vec![9u8; 1]),
                DynSolValue::FixedBytes(FixedBytes::from_slice(&[0u8; 32]), 32),
            ]).abi_encode_packed();

        base_sig_module.set_signature(empty_node_sig.into());

        let expected_err = eyre!("Invalid signature flag");

        let res = base_sig_module.recover_branch().await.unwrap_err();
        assert_eq!(res.to_string(), expected_err.to_string());

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_signature() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;
        let sig_str = "0x00606673ffad2147741f04772b6f921f0ba6af0c1e77fc439e65c36dedf4092e88984c1a971652e0ada880120ef8025e709fff2080c4a39aae068d12eed009b68c891c01";
        let sig = from_hex_string(sig_str)?;

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());

        let expected_root = parse_hex_to_bytes32(
            "0x0000000000000000000000607e5f4552091a69125d5dfcb7b8c2659029395bdf",
        )?;

        let config = base_sig_module.recover_branch().await?;
        assert_eq!(config.0, 96);
        assert_eq!(config.1, expected_root);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_signatures() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x8135063f3715f6b6fead77308d0dff538e81f12a1a005d7ed36f5fa4f8dc4385",
        )?;
        let sig_str =
    "0x016a5c6bd1597b1411cce0e79a0841fd11073120493b02602772c5eb924d7d661948d57e17785b4ef414c67e0000422643549ee4ebb680818e94599fdeb0eae9a7f66773712e9f0bf09ac2614dfe0f0116d8e3e5300f19d657bebf9382d7cb4fab11c041397e828742949f98f7bcdb1c010073f92e1700afc4288e948b2524c7e3d5ce9eba1f54bc8e8f01735ee27cf5cf0fc11c83b48afb9c48c4601b530fdd31d0c80cac22b8e537b84c3897091b4e5e91de1c01"
    ;
        let sig = from_hex_string(sig_str)?;

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());

        let expected_root = parse_hex_to_bytes32(
            "0xbdee0174cb6901d03d656b19023a24727bb42562e4966821acc43566a5862fb9",
        )?;

        let config = base_sig_module.recover_branch().await?;
        assert_eq!(config.0, 211);
        assert_eq!(config.1, expected_root);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_address() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;
        let sig_str = "0x01080000000000000000000000000000000000000001";

        let sig = from_hex_string(sig_str)?;
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());
        base_sig_module.set_weight(8);

        let expected_root = parse_hex_to_bytes32(
            "0x0000000000000000000000080000000000000000000000000000000000000001",
        )?;

        let config = base_sig_module.recover_branch().await?;
        assert_eq!(config.0, 8);
        assert_eq!(config.1, expected_root);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_addresses() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x77426bd71a0ff8a96376b0a31f0490b3822fb4166b26dfa702b04060a73bdfcd",
        )?;
        let sig_str = "0x01578a0f51d824b5e3a0c7e281705ca89132b30cf1da01a6e169d12d00ba6a9ea7640c15fb9e42ef7d922a5801adfd9b862647ef9ef577268da70f062bc4f41efc4d0172e2c6eb80e0fbdf4d77fcec0430a5aa90d33b0362016acf6885a6fbdb0e45a5893ae7599bab10772da5f8016e794132370b3980da25aa35c65a605018be45bfd201ffdf370e0fe41a8c00e16faa5dedf4dd345b1b13d4017d68928c5be946ff4870a087c055f22bc23beaa75501c41b1324ba2bcade55c4be5c4b0d2a66c4fad79bdd01b514d68b05fe03995d8e084b61c6b22427668c1a360141d50b4eae0d953ea622eba912eb091a2c887971900125d47a77a6b3400d4dcf23e37f77b9ec3699fe17740179a8781bb7b1f342c9626b730e276b1043cdb8d74801d608843017174e9eabfc28a4a5707ded62da28689b01a46f463a87cb6d15db1cbf961e81ac691c4062de460100caa26394702e3dc4e6e99ec74fa90a51a6f48f37019b0e5fff7132492a181f956adbfe64df2b2523d512016ebbd01c20a1f1c2026ce5aa4ba9ba53b340ade5b101e051d32da545a1104233b5ea550e399ede7c17c37f0123e9c5c947faf1b7d40628a5beafd8827430980b0701940f6ff13323eda85d15c013495068b4d44bad66d401b7291d4959e2c02bc69cf96f9933a75ac6230a7f5d01cfa1baf3cf6542f2970bb5be1212d6c0a8bf9cc5b00106904bd75b49070cd2031922637f28fcf699590a9001e4c22c2b3a6d3fec3d593fe9e9831defa49bdaf265015c34049d3b3d5c17f3d330b023a4bbde465dd7fa9b0123bdce7896b96f7c8d5c52a487b2ae90ebcfe5d0f001e807b6d001dfd57183e8e3aa491676024d045e1e8701627fab899d9fd1691658267a5839e63ef9dafac96301a13eb62efa60e1d449faeb313effd49f5155f06b7301a2db186f50ffe2e49dbc5fb1b405efe763e15a4e890153ea9e0865e0d0439b39b485d776d0fc00886dd2210125b419261e560c4adfb8756c4c1024a67b93bb99d50100e858f73ee92a2b5f2f7f5ad9542ca635e58de40b018c1b8ec711310fb0753a5cefeec01a5faff98a6d8601681af54df94479e75b9c56c96e3270ad943c857f22018b7eaa2f3f4a44dff798b44754d03c0a82ecf11d4a01da7544bb6d4f513df2fd44e84ce223c9798032b6e401400bff183e445a582ea1b5e072b23df73393907e3001c4492b2a699fccc1bc642556c8ef69f5cf31bc9633";

        let sig = from_hex_string(sig_str)?;
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());

        let expected_root = parse_hex_to_bytes32(
            "0xccbac9f84ae4bcdea556e517867a13fcbbd78828afbff50830cad3e8568f7d4c",
        )?;

        let (weight, root) = base_sig_module.recover_branch().await?;
        assert_eq!(weight, 0);
        assert_eq!(root, expected_root);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_dynamic() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x46b4d9f7ecd11f068d393e379551b51779a9d03d8f9c499a0b1cafb3f38b71ee",
        )?;
        let sig_str = "0x02c4839d96957f21e82fbcca0d42a1f12ef6e1cf82e90000420ebcabc657ff17f2c9e23f5fe81c69c673f6ac84716def54677028c3458c799132e327c6c8afc2770b95ffc1f497a1260356a6a13b25744707d8594a716f7f431c01";
        let sig = from_hex_string(sig_str)?;

        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());

        let expected_root = parse_hex_to_bytes32(
            "0x0000000000000000000000c4839d96957f21e82fbcca0d42a1f12ef6e1cf82e9",
        )?;

        let config = base_sig_module.recover_branch().await?;
        assert_eq!(config.0, 196);
        assert_eq!(config.1, expected_root);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_node() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;
        let sig_str = "0x0300000000000000000000000000000000000000000000000000000000deadbeef";

        let sig = from_hex_string(sig_str)?;
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());

        let expected_root = parse_hex_to_bytes32(
            "0x00000000000000000000000000000000000000000000000000000000deadbeef",
        )?;

        let config = base_sig_module.recover_branch().await?;
        assert_eq!(config.0, 0);
        assert_eq!(config.1, expected_root);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_branch_nodes() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0xe552f6b9e99fee7eb57c1086faa4fad96778681b8733ec2b3cb37047881d14d8",
        )?;
        let sig_str = "0x03afc8347dfadbeb5b0c3302252f9a73af0e6bfc6c7193d145ce5db3754dfc43360318c59652829148160144dc184a5b0524885c086ac7599f158920ef97024ed37503ed33ba97fc132740a225c6d758392e7e3b27a9408ccc7da6de43cdc466af74cf03ec80dedf001cb2de62bd8e5d4cdbc4440fafb75c259769794c1a18b198a4753f03e7f5261c74f9a8c202489bd088d4f704016c7beb3a4c7dd391ab49c949c832bc03a36c2dc9b88007e34d00a8e920ee724608a187e5397aaf478b8b0e00bf9dce4c030d3a98a4eded972821374cfe72ca523865ad55a83322f8a5f0c0cc479c63df1403f5abf2dc9621550a065d24ba45103411aa44c82baad7f7efd7da499785c0df0c0340295272065c2d52d382bbc4b34155a8eaea1076162e8e1f8fd0bec92fd1966b032ec97fb8d2829e9e7b1b667e50a00175da600aa2d68b96b067e970fde3bd5454034cc8a080097df399f52cd4eeca023ff651148bea5f56fa9a2dbe35f2aec3759f034c141b325071b9af771e6ba117d6aedb50ed1f1fd8d909052e601da7a538f2c203a1275d8357c11cb664e0b3eb7d8a8f9eeefd29bd5cc36fb5a6ce7f62942527c7033c3ca9df928ae546e1cb31fb81f45786df191ede4a9f20529779b35cb47d62ae032000c39c2473e4f816bfc6c15bc4ee8f8d2efbc37f799ffcc78e17d23680675603b5c5cdc77701a19946475cf4c767f3f60c60e28a5db97331bbbaed80984084e20392f4d2b55c38a442230e649c581179bd31d82cc05362bf5ce31629a13ddb9dd8039cbb4a4ccc692962fd96bfb1b01964e0276130116db5d6f055e6d542ca4cd9de031b7bb48663dfd94c8516166427e90a0db662e43dc0f22bdf2ceee3938b46554103e14b6a146e027bbcee25f1b3850e713b10e74b543c5c635ea9c4903b751270f703184ed9ff8d8df8cf951285e60125937dd83b083771d966c85e740126070fbef003cc1d6da1be980aee046bb3ba879d0e36031c60ba231385dea83b522bf48a374503bb2855e0b782fc3dfe9bed092e66396a92e95aaa9e7ebc30c670a1e35863a2b20304996222f8d2372deab95607b6b9a0d691de6300b41654c71b5f8df2308832b603d2ae4d7042372d40b42a12d135922dc1dbee925f9758c906cb203708dc3a543e03d8aeb7733a9b9af884870127489a194ebcb5c1bb3268e73c4106b28d964f7105034f8bbc54958192bb8103778c5d2758b9c5270318ca8142ec0c8ee6bc3e1df19c03a5d2851f88ba1875fa3de049c28cf1fb682f44a2abc860ef7bfe05d49b81411f0348685e05ead83ab0bada11f206dcf6ab0b12b16c5fbdbd51ae4251efd1a3ddf90316af51ff820d944e5ee38057f21bd39541235752521413323e0410cc9429bd4d0339357e7e19716b0895149f7cfa64c00091b7b40bd924a41fe7f705dced20dc11039562dc76f708a71e32473e119553b6104fb6c91a119f4715ec0c1c402c03b63c033d5bfc9f8dfded3480bed8a869b3de489b0f40e82051c7ea4e93ab2d2600ad16039818d53295ba6a71ef2f4b7f12e3b39169fcba6a164139f9c5259d4303db9c600379631754cd4dc39337d567f6e1c82c6c0684960a7ef7f52ac453e92095185f8c03c5ea812a8f43383afcfc4485b603a5f38fe2c5cafd7191928f31370695b9b16a03fd94e960332eaf387dd1ae414a879df6231af2698f406601891553c8dc8c59ba0322384224be3ed5977635cd2e16bbcee1153a54a2bea32c3a98ceef6da16fa4ca03412fbb40ef0c777867233a3fd9cc2ea32f26d07dda178758a574e8aa36230799030d5dd6d8abb5c3754c61104545e09a4c2c358326828031f9d4dc4750be20097203a6704fdb83fa22e20a00d751e2579deb24e0349aa9089341645ad03d2f5930e203717bcb0cc9adee4d57b4b5f65f32e8ccacd3e244c56fc5d72c6e718642755ce603de7778ddee2750bcb9f8c1014b96895c9fdb483e41393987d3bf504ee89dad2b03a46b8ae796d9e75429e7eda72748cfceae94bc4ba5cb5557604db99a8b8ac60a03fa17d4a17d9cdc0dd4210413a079dd8729c0b7de8c857780af13b10c7e9c88aa035c88fc4f5f9de20ec9edff05e94a9597f3de69a51d938e7edb72b010d604c0cb035980984d410028c1bfd3dff3cac44d13ba4a64448f91ee2811e52823d7764434034da13457c17f2be89226e008221d89d57464b91abf0e745f5f5e1862b410dd07035db0e8564856c6bbda5e9778eb60418631e7b08e0416965955e5ef4db20e527a03a27efb56c62c2e953db262616ac2d8bc09c13b3b7b25bd1efc91f3f5117d5f07032d925aae467c28cbf461699fbd267b5e9350cb9afbc1d6b2c58f6bb59278442303f7ee09fd0aa17be642271e27f781c7d8091d1366500b997e73089504a02b9de3037e0034468aa54dbb0ba2da9578f0b0238503c1d55980818769870cc5bc652ae20331243a150607bce8f1edae4672933f96fb9cf70329866e04b862b4f81fb98f40034d3f8e22b12ca3c54d7e957642f71645ecd9aef427de9583d4401d00cac6fb1d033dda27871280498517ec6d3c21674c0d9d7c31c829dca478a955faeba0300dbb0347d515d9a00e2e0744a578229c1bbdc42632bbedfa8313689f96c47f1d70a0ae0348b095b60c77ff1604bad682878e62d745f3285319bd375fd7672b8ff45ff8ea037a97499c8c873bd7cb6e79a8bb19bb3a65f3b3fc35c09bd67eab08d128cc8ba303099aaa24268669fc37061f10c89909cfe104bb265d2ff5a7154b6054cafd3db703ea7498586d79b1bb720bf0a5c886b9387755fdf2f9f60cfae60d7b81180c3a530379b7835a4bb87eb7ea6fabd1f3722ea9c05909bdf28d4323a7471be9fd3fc56303a6fd23ee6c88bd23e9c583ff21ecbbd35faf86df32f071c3a2dd0c3c9eadb30e0392ff1f85ed3170dc497bbb7b0be681619ba6bee0baeb7d247f75da233f1e8add03333ae57b1a478c4666bde64e072ef3e80b780d4ab51b4cf0516251a1f20c059a03a4bd0e0737b4f7bbbfb82a810b598886159b197bb6d44bfd2c414f0a86ea2cc603248856eac802b39998bd1cfda213a54109f0fb504f447c79444792705b02176903db71134f1c6fa41e13512fffd3f8526ce7eb4d68063f494623978114877caa2b03b6a733edd7a0fcdc4403c8c7594f41f9a7152b36ca6da5afbecd20ae008feaa203ae23b9fdce42e555d54ec02c5b934f55072feeb48e322b2c7a36e4ff364b329a03ea2889b953ef057d7675f24ca6e5ccae4627c40c7db2159e2f59337856c9ad0d03cc2ca7ff62344bf0fefe98ec31944d3d35e8708e01f754af4f15351e4d84980c034704ae4538bf882fee2edf320a8683181cc251988164e9f43be41531f1ab0ebe0330f42150fd80f46a18c1fa649845457efdb420d061aacc31049da608d0150bb903f7ab31da11499870132ff5b2d7eceefb3ff831a0ed03e67a38a4c6b586fd07be03b0e17fa825f2e263af8ddba26bc34a67ddefc6f99848a1490dc93416a42520eb03e0e304ed75b143c9503ed25e0777927091e58177d7420b2d4ec6de7da37df032038fa2b7fca33fbe0ea2b7f8de3e115dc612151b7867cc0ba7102c334e58fa43b703ef5e63be51426296c50dcbf7b60a7f6037257dcd988c4671866b4c039679303c03c410754bf8eb479d20ff992fc51d5cce60d8399485599b32f5b4f6cbf501e2b9034348272d2fb37fadad0a10891b00a278398ee4a588c7921a233106b78fc7a493038d2caf3ea714177176d8a1837f7ebbae643ba9129dca11fbbe4d3336b777e57c0353fb3466fd98a829e4406dd1f991884ce3f5ae30ffca2ca285bbbaf33ba86260035af697014013bb5a57d9fcc68bed8d76e449bb92cb09c9f6d8575167352742f203fdcb14e7798d3f92d42f9074ab08682cfd92898ed19f4bfbeea92e6ea01362810383a1deebadde924d0befd890511289e386fc32ea8fde1a6e0eb97b782627ece303e230b3ce5be2a667d4050277afc381473dcf857376996e2fb89c1327ff54d0bd03cf98700fc30b2e414b11cd3bea72ff2d7c7b9a9cc939169f4b8cce93ed48a060";

        let sig = from_hex_string(sig_str)?;
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());

        let expected_root = parse_hex_to_bytes32(
            "0x9e8610d05930c453860bcd5933b00e758b46d91d44f3c32087cd3f4e7e4d3de3",
        )?;

        let config = base_sig_module.recover_branch().await?;
        assert_eq!(config.0, 0);
        assert_eq!(config.1, expected_root);

        Ok(())
    }

    #[tokio::test]
    async fn test_recover_simple() -> Result<()> {
        let subdigest = parse_hex_to_bytes32(
            "0x21c816235ccd179f03e4027691a68a7f70387fdd70cef9dba02a39ffba192856",
        )?;
        let sig_str = "0x00110000000000025381b31277854cdcbf3feba4366454231d6f938c714464fb6a5ab564d6fe5fc76b8fb4513c4eda90e96c2cf7586bdfb25f55dcea82146288781d1cf82b95d9771b01";

        let sig = from_hex_string(sig_str)?;
        let mut base_sig_module = SigModule::empty();
        base_sig_module.set_subdigest_direct(subdigest);
        base_sig_module.set_signature(sig.into());

        let expected_root = parse_hex_to_bytes32(
            "0x50ec12b237887c47767742e6425b98694ac9f793a31729766ea4748b382ea648",
        )?;

        let config = base_sig_module.recover(0).await?;
        assert_eq!(config.threshold, 17);
        assert_eq!(config.checkpoint, 0);
        assert_eq!(config.weight, 2);
        assert_eq!(config.image_hash, expected_root);

        Ok(())
    }
}
