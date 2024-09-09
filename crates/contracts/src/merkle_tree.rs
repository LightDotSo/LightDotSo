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

// Copyright 2023-2024 Pia Park.
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

// From: https://github.com/rkdud007/alloy-merkle-tree/blob/de47ec9e67ce62d6bb8981051f94f2d8296f51da/src/standard_binary_tree.rs
// License: Apache-2.0
// Thank you to `rkdud007` for the original implementation!

use alloy::{
    dyn_abi::DynSolValue,
    primitives::{keccak256, Keccak256, B256},
};
use core::panic;
use hashbrown::HashMap;

/// The error type for the [StandardMerkleTree].
#[derive(Debug)]
pub enum MerkleTreeError {
    /// The tree is empty.
    LeafNotFound,
    /// Invalid check.
    InvalidCheck,
    /// The root hash have no siblings.
    RootHaveNoSiblings,
    /// Leaf is not supported type.
    NotSupportedType,
}

#[derive(Debug)]
pub struct StandardMerkleTree {
    tree: Vec<B256>,
    tree_values: HashMap<String, usize>,
}

impl Default for StandardMerkleTree {
    fn default() -> Self {
        Self::new(Vec::new(), Vec::new())
    }
}

impl StandardMerkleTree {
    pub fn new(tree: Vec<B256>, values: Vec<(&DynSolValue, usize)>) -> Self {
        let mut tree_values = HashMap::new();
        for (tree_key, tree_value) in values.into_iter() {
            let tree_key_str = Self::check_valid_value_type(tree_key);
            tree_values.insert(tree_key_str, tree_value);
        }
        Self { tree, tree_values }
    }

    pub fn of(values: &[DynSolValue]) -> Self {
        let hashed_values: Vec<(&DynSolValue, usize, B256)> = values
            .iter()
            .enumerate()
            .map(|(i, value)| (value, i, standard_leaf_hash(value)))
            .collect();

        let hashed_values_hash =
            hashed_values.iter().map(|(_, _, hash)| *hash).collect::<Vec<B256>>();

        let tree = make_merkle_tree(hashed_values_hash);

        let mut indexed_values: Vec<(&DynSolValue, usize)> =
            values.iter().map(|value| (value, 0)).collect();

        for (leaf_index, (_, value_index, _)) in hashed_values.iter().enumerate() {
            indexed_values[*value_index].1 = tree.len() - leaf_index - 1;
        }

        Self::new(tree, indexed_values)
    }

    pub fn root(&self) -> B256 {
        self.tree[0]
    }

    pub fn get_proof(&self, value: &DynSolValue) -> Result<Vec<B256>, MerkleTreeError> {
        let tree_key = Self::check_valid_value_type(value);

        let tree_index = self.tree_values.get(&tree_key).ok_or(MerkleTreeError::LeafNotFound)?;

        make_proof(&self.tree, *tree_index)
    }

    fn get_leaf_hash(&self, leaf: &DynSolValue) -> B256 {
        standard_leaf_hash(leaf)
    }

    pub fn verify_proof(&self, leaf: &DynSolValue, proof: Vec<B256>) -> bool {
        let leaf_hash = self.get_leaf_hash(leaf);
        let implied_root = process_proof(leaf_hash, proof);
        self.tree[0] == implied_root
    }

    fn check_valid_value_type(value: &DynSolValue) -> String {
        match value {
            DynSolValue::String(inner_value) => inner_value.to_string(),
            DynSolValue::FixedBytes(inner_value, _) => inner_value.to_string(),
            _ => panic!("Not supported value type"),
        }
    }
}

fn standard_leaf_hash(value: &DynSolValue) -> B256 {
    let encoded = match value {
        DynSolValue::String(inner_value) => inner_value.as_bytes(),
        DynSolValue::FixedBytes(inner_value, _) => inner_value.as_ref(),
        _ => panic!("Not supported value type for leaf"),
    };
    keccak256(keccak256(encoded))
}

fn left_child_index(index: usize) -> usize {
    2 * index + 1
}

fn right_child_index(index: usize) -> usize {
    2 * index + 2
}

fn sibling_index(index: usize) -> Result<usize, MerkleTreeError> {
    if index == 0 {
        return Err(MerkleTreeError::RootHaveNoSiblings);
    }

    if index % 2 == 0 {
        Ok(index - 1)
    } else {
        Ok(index + 1)
    }
}
fn parent_index(index: usize) -> usize {
    (index - 1) / 2
}

fn is_tree_node(tree: &[B256], index: usize) -> bool {
    index < tree.len()
}

fn is_internal_node(tree: &[B256], index: usize) -> bool {
    is_tree_node(tree, left_child_index(index))
}

fn is_leaf_node(tree: &[B256], index: usize) -> bool {
    !is_internal_node(tree, index) && is_tree_node(tree, index)
}

fn check_leaf_node(tree: &[B256], index: usize) -> Result<(), MerkleTreeError> {
    if !is_leaf_node(tree, index) {
        Err(MerkleTreeError::InvalidCheck)
    } else {
        Ok(())
    }
}

fn make_merkle_tree(leaves: Vec<B256>) -> Vec<B256> {
    let tree_len = 2 * leaves.len() - 1;
    let mut tree = vec![B256::default(); tree_len];
    let leaves_len = leaves.len();

    for (i, leaf) in leaves.into_iter().enumerate() {
        tree[tree_len - 1 - i] = leaf;
    }

    for i in (0..tree_len - leaves_len).rev() {
        let left = tree[left_child_index(i)];
        let right = tree[right_child_index(i)];

        tree[i] = hash_pair(left, right);
    }

    tree
}

fn make_proof(tree: &[B256], index: usize) -> Result<Vec<B256>, MerkleTreeError> {
    check_leaf_node(tree, index)?;

    let mut proof = Vec::new();
    let mut current_index = index;
    while current_index > 0 {
        let sibling = sibling_index(current_index)?;

        if sibling < tree.len() {
            proof.push(tree[sibling]);
        }
        current_index = parent_index(current_index);
    }

    Ok(proof)
}

fn process_proof(leaf: B256, proof: Vec<B256>) -> B256 {
    proof.into_iter().fold(leaf, hash_pair)
}

fn hash_pair(left: B256, right: B256) -> B256 {
    let combined = if left <= right { left } else { right };
    let second = if left <= right { right } else { left };

    let mut hasher = Keccak256::new();
    hasher.update(combined);
    hasher.update(second);
    hasher.finalize()
}

#[cfg(test)]
mod test {
    use super::*;
    use alloy::{
        dyn_abi::DynSolValue,
        primitives::{hex::FromHex, FixedBytes},
    };

    #[test]
    fn test_tree_string_type() {
        let num_leaves = 1000;
        let mut leaves = Vec::new();
        for i in 0..num_leaves {
            leaves.push(DynSolValue::String(i.to_string()));
        }
        let tree = StandardMerkleTree::of(&leaves);

        for leaf in leaves.into_iter() {
            let proof = tree.get_proof(&leaf).unwrap();
            let bool = tree.verify_proof(&leaf, proof);
            assert!(bool);
        }
    }

    #[test]
    fn test_tree_bytes32_type() {
        let mut leaves = Vec::new();

        let leaf = DynSolValue::FixedBytes(
            FixedBytes::<32>::from_hex(
                "0x46296bc9cb11408bfa46c5c31a542f12242db2412ee2217b4e8add2bc1927d0b",
            )
            .unwrap(),
            32,
        );

        leaves.push(leaf);

        let tree = StandardMerkleTree::of(&leaves);

        for leaf in leaves.into_iter() {
            let proof = tree.get_proof(&leaf).unwrap();
            let bool = tree.verify_proof(&leaf, proof);
            assert!(bool);
        }

        let root = tree.root();
        assert_eq!(
            root,
            B256::from_hex("0x0030ce873e657283a8e03a3e83ba95a0bf1ad049e8ac1cb8148280aca2b1adc7")
                .unwrap()
        );
    }
}
