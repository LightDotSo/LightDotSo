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
