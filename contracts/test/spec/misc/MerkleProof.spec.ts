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
    "0x6533e70db8d22349cf8a5801c9c3374f46d129f3996735f5c672f1ceb48b355a",
    "0x795c3a1e8cb7a18dcb6e394009d3349ab13e7e2bb5fa164175d5196c20b81344",
    "0x2ea4ef13340f3e4c9d91df527af7c53796caf699ac36b471a7c6981cdd3e6b78",
  ];

  const merkleRoot =
    "0xc22e9fefbe932d09ff716df348c6be54ccc022b9006764cb6ff8c18cf98da375";

  const leaves = merkleHashes.map(x => hexToBytes(x)).sort(Buffer.compare);

  // Add an empty leaf if the number of leaves is odd
  if (leaves.length % 2 === 1) {
    leaves.push(new Uint8Array(32));
  }

  const tree = new MerkleTree(leaves, keccak256);

  expect(tree.getHexRoot()).to.equal(merkleRoot);
});
