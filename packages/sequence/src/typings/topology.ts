// Copyright 2023-2024 Light
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

// From: https://github.com/0xsequence/sequence.js/blob/3fa8067a5df6332784501794a90af583254e5b88/packages/core/src/v2/config.ts#L1
// License: Apache 2.0

// -------------------------------------------------------------------------
// Standard
// -------------------------------------------------------------------------

// A signer leaf in a signature tree.
export type SignatureLeaf = {
  address: string;
  weight: bigint;
  signature: string;
};

// A subdigest leaf in a signature tree.
export type SubdigestLeaf = {
  subdigest: string;
};

// A nested leaf in a signature tree.
export type NestedLeaf = {
  tree: Topology;
  weight: bigint;
  threshold: bigint;
};

// A node in a signature tree.
export type NodeLeaf = {
  nodeHash: string;
};

// A leaf in a signature tree.
export type Leaf = SignatureLeaf | SubdigestLeaf | NestedLeaf | NodeLeaf;

// A node in a signature tree.
export type Node = {
  left: Node | Leaf;
  right: Node | Leaf;
};

// The topology of a signature tree.
export type Topology = Node | Leaf;

// -------------------------------------------------------------------------
// Recovery
// -------------------------------------------------------------------------

// An address leaf in a recovery phase.
// Unlike a signature leaf, an address leaf does not contain a signature.
// Used for `SignaturePartType.Signature` recovery.
export type RecoverySignatureLeaf = Omit<SignatureLeaf, "signature">;

// A signer leaf in a recovery phase.
// Unlike a signature leaf, a signer leaf contains a signature with a hex.
// Used for `SignaturePartType.DynamicSignature` recovery.
export type RecoveryDynamicSignatureLeaf = Omit<
  SignatureLeaf,
  "address" | "signature"
> & {
  signature: `0x${string}`;
};

// A node leaf in a recovery phase.
// Used for `SignaturePartType.Node` recovery.
export type RecoveryNodeLeaf = NodeLeaf;

// A subdigest leaf in a recovery phase.
// Used for `SignaturePartType.Subdigest` recovery.
export type RecoverySubdigestLeaf = SubdigestLeaf;

// A nested leaf in a recovery phase.
// Used for `SignaturePartType.Nested` recovery.
export type RecoveryNestedLeaf = Omit<NestedLeaf, "tree"> & {
  tree: RecoveryTopology;
};

// A leaf in a recovery phase.
export type RecoveryLeaf =
  | RecoverySignatureLeaf
  | RecoveryDynamicSignatureLeaf
  | RecoveryNodeLeaf
  | RecoverySubdigestLeaf
  | RecoveryNestedLeaf;

// A node in a recovery phase.
// The right node is optional, because of the way in which recovery phases are constructed.
export type RecoveryNode = {
  left: RecoveryNode | RecoveryLeaf;
  right?: RecoveryNode | RecoveryLeaf;
};

// The topology of a recovery phase.
export type RecoveryTopology = RecoveryNode | RecoveryLeaf;
