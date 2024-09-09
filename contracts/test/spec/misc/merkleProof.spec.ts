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

import {
  SimpleMerkleTree,
  StandardMerkleTree,
} from "@openzeppelin/merkle-tree";
import { MerkleTree } from "merkletreejs";
import type { Hex } from "viem";
import { hexToBytes, keccak256 } from "viem";
import { expect, test } from "vitest";

test("Should return correct merkle root", () => {
  const merkleHashes: Hex[] = [
    "0x2ea4ef13340f3e4c9d91df527af7c53796caf699ac36b471a7c6981cdd3e6b78",
    "0x6533e70db8d22349cf8a5801c9c3374f46d129f3996735f5c672f1ceb48b355a",
    "0x795c3a1e8cb7a18dcb6e394009d3349ab13e7e2bb5fa164175d5196c20b81344",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  // // Add an empty leaf if the number of leaves is odd
  // if (leaves.length % 2 !== 0) {
  //   leaves.push(new Uint8Array(32));
  // }

  const merkleRoot =
    "0xf79d62b0d87b6d1ff3f2492acc441100bf98127714feb1d31facf572564e0ae7";

  const _tree = new MerkleTree(leaves, keccak256, {
    // sort: true,
    // isBitcoinTree: false,
  });

  // console.log(tree.getProofs());

  // Construct a tree with the same leaves
  const standardTree = StandardMerkleTree.of(
    [merkleHashes],
    ["bytes32", "bytes32", "bytes32", "bytes32"],
  );

  expect(standardTree.root.toString()).to.equal(merkleRoot);
});

test("single merkle tree", () => {
  const merkleHashes: Hex[] = [
    "0x46296bc9cb11408bfa46c5c31a542f12242db2412ee2217b4e8add2bc1927d0b",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
    // isBitcoinTree: false,
  });

  const _root = tree.getHexRoot();
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(_root);

  const standardTree = StandardMerkleTree.of([merkleHashes], ["bytes32"]);

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(standardTree.root.toString());

  const _proof = standardTree.getProof(0);

  const _standardTreeRoot = standardTree.root.toString();

  expect(_standardTreeRoot).to.equal(
    "0x0030ce873e657283a8e03a3e83ba95a0bf1ad049e8ac1cb8148280aca2b1adc7",
  );
});

test("one merkle tree", () => {
  const merkleHashes: Hex[] = [
    "0x0000000000000000000000000000000000000000000000000000000000000001",
  ];

  const standardTree = StandardMerkleTree.of([merkleHashes], ["bytes32"]);

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(standardTree.root.toString());

  const _standardTreeRoot = standardTree.root.toString();

  expect(_standardTreeRoot).to.equal(
    "0xb5d9d894133a730aa651ef62d26b0ffa846233c74177a591a4a896adfda97d22",
  );
});

test("simple merkle tree", () => {
  const merkleHashes: Hex[] = [
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
    // isBitcoinTree: false,
  });

  // const proof = tree.getProof(leaves[0]);

  const _root = tree.getHexRoot();

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(_root);

  const standardTree = StandardMerkleTree.of(
    [merkleHashes],
    ["bytes32", "bytes32"],
  );

  const _proof = standardTree.getProof(0);

  const _standardTreeRoot = standardTree.root.toString();

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(_standardTreeRoot);

  const _simpleTree = SimpleMerkleTree.of(leaves);

  expect(_standardTreeRoot).to.equal(
    "0xe685571b7e25a4a0391fb8daa09dc8d3fbb3382504525f89a2334fbbf8f8e92c",
  );
});

test("simple nested merkle tree", () => {
  const merkleHashes: Hex[] = [
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000000000000000000000000000003",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
    // isBitcoinTree: false,
  });

  // const proof = tree.getProof(leaves[0]);

  const _root = tree.getHexRoot();

  const standardTree = StandardMerkleTree.of(
    [merkleHashes],
    ["bytes32", "bytes32", "bytes32"],
  );

  const _proof = standardTree.getProof(0);

  const _standardTreeRoot = standardTree.root.toString();

  const _simpleTree = SimpleMerkleTree.of(leaves);

  expect(_standardTreeRoot).to.equal(
    "0x6bf4e61b5cdb00b5d13973040b7e7c9690fc0e3e3509eabf38ee45a4fe1a3c0a",
  );
});

test("simple deep nested merkle tree", () => {
  const merkleHashes: Hex[] = [
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000000000000000000000000000003",
    "0x0000000000000000000000000000000000000000000000000000000000000004",
    "0x0000000000000000000000000000000000000000000000000000000000000005",
    "0x0000000000000000000000000000000000000000000000000000000000000006",
    "0x0000000000000000000000000000000000000000000000000000000000000007",
    "0x0000000000000000000000000000000000000000000000000000000000000008",
    // "0x0000000000000000000000000000000000000000000000000000000000000009",
    // "0x0000000000000000000000000000000000000000000000000000000000000010",
    // "0x0000000000000000000000000000000000000000000000000000000000000011",
    // "0x0000000000000000000000000000000000000000000000000000000000000012",
    // "0x0000000000000000000000000000000000000000000000000000000000000013",
    // "0x0000000000000000000000000000000000000000000000000000000000000014",
    // "0x0000000000000000000000000000000000000000000000000000000000000015",
    // "0x0000000000000000000000000000000000000000000000000000000000000016",
    // "0x0000000000000000000000000000000000000000000000000000000000000017",
    // "0x0000000000000000000000000000000000000000000000000000000000000018",
    // "0x0000000000000000000000000000000000000000000000000000000000000019",
    // "0x0000000000000000000000000000000000000000000000000000000000000020",
    // "0x0000000000000000000000000000000000000000000000000000000000000021",
    // "0x0000000000000000000000000000000000000000000000000000000000000022",
    // "0x0000000000000000000000000000000000000000000000000000000000000023",
    // "0x0000000000000000000000000000000000000000000000000000000000000024",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
    // isBitcoinTree: true,
  });

  const _root = tree.getHexRoot();

  // const standardTree = StandardMerkleTree.of(
  //   [merkleHashes],
  //   ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
  // );

  // const proof = standardTree.getProof(0);

  // console.log(proof);

  // console.log(standardTree.dump());

  // console.log(standardTree.render());

  // const standardTreeRoot = standardTree.root.toString();
  // console.log(standardTreeRoot);

  const simpleTree = SimpleMerkleTree.of(leaves);

  expect(tree.getHexRoot()).to.equal(simpleTree.root.toString());
});
