// Copyright 2023-2024 Light, Inc.
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

import { MerkleTree } from "merkletreejs";
import type { Hex } from "viem";
import { hexToBytes, keccak256 } from "viem";
import { expect, test } from "vitest";

test("Should return correct merkle root", () => {
  const merkleHashes: Hex[] = [
    "0x834b700bc560239a677f06e26ff6abcc1cf6d794bed54dd0089ee990ba466565",
    "0x84f406077106fc9292d17749f6f1d1de9b4847fe2a37f484d3ca209a55a56557",
    "0x8fb31ec39c87ecfd9c0d00056dcdb3f690df52b0996447cfa2d8d588b7b0da0a",
  ];

  const merkleRoot =
    "0x1bb0308011ace89210f9abe59b08424fea75761f59073f8ead92f5cc932d5dce";

  const leaves = merkleHashes.map(x => hexToBytes(x)).sort(Buffer.compare);

  // Add an empty leaf if the number of leaves is odd
  if (leaves.length % 2 !== 0) {
    leaves.push(new Uint8Array(32));
  }

  const tree = new MerkleTree(leaves, keccak256);

  expect(tree.getHexRoot()).to.equal(merkleRoot);
});
