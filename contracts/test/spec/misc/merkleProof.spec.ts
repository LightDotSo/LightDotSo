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

  const standardTree = StandardMerkleTree.of([merkleHashes], ["bytes32"]);

  const simpleTree = SimpleMerkleTree.of(leaves);

  expect(simpleTree.root.toString()).to.equal(
    "0x0030ce873e657283a8e03a3e83ba95a0bf1ad049e8ac1cb8148280aca2b1adc7",
  );

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

  const tree = new MerkleTree(merkleHashes, keccak256, {
    sort: true,
    // isBitcoinTree: false,
  });

  const _root = tree.getHexRoot();

  expect(_root).to.equal(
    "0x0000000000000000000000000000000000000000000000000000000000000001",
  );

  const _proof = standardTree.getProof(0);

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

  const _root = tree.getHexRoot();

  expect(_root).to.equal(
    "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
  );

  const _proof = tree.getProof(merkleHashes[0]);

  expect(proofToHex(_proof)[0]).to.eql(
    "0x0000000000000000000000000000000000000000000000000000000000000002",
  );

  const standardTree = StandardMerkleTree.of(
    [merkleHashes],
    ["bytes32", "bytes32"],
  );

  // const _proof = standardTree.getProof(0);

  const _standardTreeRoot = standardTree.root.toString();

  const simpleTree = SimpleMerkleTree.of(leaves);

  expect(simpleTree.root.toString()).to.equal(
    "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
  );

  const proof = simpleTree.getProof(merkleHashes[0]);

  expect(proof[0]).to.eql(
    "0x0000000000000000000000000000000000000000000000000000000000000002",
  );

  expect(_standardTreeRoot).to.equal(
    "0x7fef4bf8f63cf9dd467136c679c02b5c17fcf6322d9562512bf5eb952cf7cc53",
  );
});

test("not sorted tree", () => {
  const merkleHashes: Hex[] = [
    "0x0000000000000000000000000000000000000000000000000000000000000003",
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
    // isBitcoinTree: false,
  });

  const _root = tree.getHexRoot();

  expect(_root).to.equal(
    "0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87",
  );

  const _proof = tree.getProof(merkleHashes[0]);

  expect(proofToHex(_proof)[0]).to.eql(
    "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
  );

  const _simpleTree = SimpleMerkleTree.of(leaves);

  expect(_simpleTree.root.toString()).to.equal(
    "0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87",
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

  expect(_root).to.equal(
    "0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87",
  );

  const _proof = tree.getProof(merkleHashes[0]);
  expect(proofToHex(tree.getProof(merkleHashes[0]))[0]).to.eql(
    "0x0000000000000000000000000000000000000000000000000000000000000002",
  );
  expect(proofToHex(tree.getProof(merkleHashes[1]))[0]).to.eql(
    "0x0000000000000000000000000000000000000000000000000000000000000001",
  );
  expect(proofToHex(tree.getProof(merkleHashes[2]))[0]).to.eql(
    "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
  );

  const standardTree = StandardMerkleTree.of(
    [merkleHashes],
    ["bytes32", "bytes32", "bytes32"],
  );

  // const _proof = standardTree.getProof(0);

  const _standardTreeRoot = standardTree.root.toString();

  const simpleTree = SimpleMerkleTree.of(leaves);

  const _simpleTreeRoot = simpleTree.root.toString();

  expect(_simpleTreeRoot).to.equal(
    "0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87",
  );

  expect(JSON.stringify(simpleTree.getProof(merkleHashes[0]))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000000000000000000000000000003",
    ]),
  );
  expect(JSON.stringify(simpleTree.getProof(merkleHashes[1]))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000003",
    ]),
  );
  expect(JSON.stringify(simpleTree.getProof(merkleHashes[2]))).to.equal(
    JSON.stringify([
      "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
    ]),
  );

  expect(_standardTreeRoot).to.equal(
    "0x6bf4e61b5cdb00b5d13973040b7e7c9690fc0e3e3509eabf38ee45a4fe1a3c0a",
  );
});

test("simple deep merkle tree", () => {
  const merkleHashes: Hex[] = [
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000000000000000000000000000003",
    "0x0000000000000000000000000000000000000000000000000000000000000004",
    "0x0000000000000000000000000000000000000000000000000000000000000005",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
    // isBitcoinTree: false,
  });

  const _root = tree.getHexRoot();

  expect(_root).to.equal(
    "0x3856185f708a95a4cef51f6538ed3ea849702a46e020430070ac99c94a831c58",
  );

  expect(JSON.stringify(proofToHex(tree.getProof(merkleHashes[0])))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      "0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0",
      "0x0000000000000000000000000000000000000000000000000000000000000005",
    ]),
  );
  expect(JSON.stringify(proofToHex(tree.getProof(merkleHashes[1])))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0",
      "0x0000000000000000000000000000000000000000000000000000000000000005",
    ]),
  );
  expect(JSON.stringify(proofToHex(tree.getProof(merkleHashes[2])))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000004",
      "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
      "0x0000000000000000000000000000000000000000000000000000000000000005",
    ]),
  );
  expect(JSON.stringify(proofToHex(tree.getProof(merkleHashes[3])))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000003",
      "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
      "0x0000000000000000000000000000000000000000000000000000000000000005",
    ]),
  );
  expect(JSON.stringify(proofToHex(tree.getProof(merkleHashes[4])))).to.equal(
    JSON.stringify([
      "0x0c48ddc2b8d6d066c52fc608d4d0254f418bea6cd8424fe95390ac87323f9c9f",
    ]),
  );

  const _standardTree = StandardMerkleTree.of(
    [merkleHashes],
    ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
  );

  const simpleTree = SimpleMerkleTree.of(leaves);

  const _simpleTreeRoot = simpleTree.root.toString();

  expect(_simpleTreeRoot).to.equal(
    "0xf6c00687a2a50c87101e36eddc215e458f8ca89ee0fb3be978e73e0ea380b768",
  );

  expect(JSON.stringify(simpleTree.getProof(merkleHashes[0]))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000000000000000000000000000005",
      "0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0",
    ]),
  );
  expect(JSON.stringify(simpleTree.getProof(merkleHashes[1]))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000005",
      "0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0",
    ]),
  );
  expect(JSON.stringify(simpleTree.getProof(merkleHashes[2]))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000004",
      "0x8ccb1afe9004b46e81f9742458856abcec79e407373a838bac2e3a4e97e00ec6",
    ]),
  );
  expect(JSON.stringify(simpleTree.getProof(merkleHashes[3]))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000003",
      "0x8ccb1afe9004b46e81f9742458856abcec79e407373a838bac2e3a4e97e00ec6",
    ]),
  );
  expect(JSON.stringify(simpleTree.getProof(merkleHashes[4]))).to.equal(
    JSON.stringify([
      "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0",
      "0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0",
    ]),
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
    "0x0000000000000000000000000000000000000000000000000000000000000009",
    "0x0000000000000000000000000000000000000000000000000000000000000010",
    "0x0000000000000000000000000000000000000000000000000000000000000011",
    "0x0000000000000000000000000000000000000000000000000000000000000012",
    "0x0000000000000000000000000000000000000000000000000000000000000013",
    "0x0000000000000000000000000000000000000000000000000000000000000014",
    "0x0000000000000000000000000000000000000000000000000000000000000015",
    "0x0000000000000000000000000000000000000000000000000000000000000016",
    "0x0000000000000000000000000000000000000000000000000000000000000017",
    "0x0000000000000000000000000000000000000000000000000000000000000018",
    "0x0000000000000000000000000000000000000000000000000000000000000019",
    "0x0000000000000000000000000000000000000000000000000000000000000020",
    "0x0000000000000000000000000000000000000000000000000000000000000021",
    "0x0000000000000000000000000000000000000000000000000000000000000022",
    "0x0000000000000000000000000000000000000000000000000000000000000023",
    "0x0000000000000000000000000000000000000000000000000000000000000024",
  ];

  const leaves = merkleHashes.map((x) => hexToBytes(x)).sort(Buffer.compare);

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
    // isBitcoinTree: true,
  });

  const _root = tree.getHexRoot();

  expect(_root).to.equal(
    "0x829aa29a4940648ff39373741e8cf185ad9cff8af1529623eacce5b528406827",
  );

  const proof = tree.getProof(merkleHashes[0]);

  expect(JSON.stringify(proofToHex(proof))).to.equal(
    JSON.stringify([
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      "0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0",
      "0x027d4202008bf9d080d976936bdbedf33e9934bc0b1745fd5712497536a83bd9",
      "0xfe80662db288f0dd9570b3f328230d82aed77131c5b2ca12e6ff8862f5676018",
      "0x62c5d723f64d0a40a5e7e1155936334a2e84fb4edafd16a6045d8b502c0e3d99",
    ]),
  );

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

function proofToHex(
  proof: {
    position: "left" | "right";
    data: Buffer;
  }[],
) {
  return proof.map((p) => `0x${p.data.toString("hex")}`);
}
