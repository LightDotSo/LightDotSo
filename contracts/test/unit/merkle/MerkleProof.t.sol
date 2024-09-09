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

// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Unit tests for `MerkleProof` for getting base hash
contract MerkleProofUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    function test_merkle_verify_empty_fail() public {
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = bytes32(0);
        bytes32 root = bytes32(0);
        bytes32 leaf = bytes32(0);
        assertFalse(MerkleProof.verify(proof, root, leaf));
    }

    function test_simple_merkle() public {
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
        bytes32 root = bytes32(0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0);
        bytes32 leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);
        assertTrue(MerkleProof.verify(proof, root, leaf));
    }

    function test_simple_nested_merkle() public {
        bytes32[] memory proof = new bytes32[](2);

        proof[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
        proof[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        bytes32 root = bytes32(0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87);
        bytes32 leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);
        assertTrue(MerkleProof.verify(proof, root, leaf));

        proof[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);
        proof[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        root = bytes32(0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87);
        leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
        assertTrue(MerkleProof.verify(proof, root, leaf));

        bytes32[] memory proof2 = new bytes32[](1);
        proof2[0] = bytes32(0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0);
        root = bytes32(0x9b0225f2c6f59eeaf8302811ea290e95258763189b82dc033158e99a6ef45a87);
        leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        assertTrue(MerkleProof.verify(proof2, root, leaf));
    }

    function test_simple_deep_merkle() public {
        bytes32[] memory proof = new bytes32[](3);
        proof[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
        proof[1] = bytes32(0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0);
        proof[2] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000005);
        bytes32 root = bytes32(0x3856185f708a95a4cef51f6538ed3ea849702a46e020430070ac99c94a831c58);
        bytes32 leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);
        assertTrue(MerkleProof.verify(proof, root, leaf));

        bytes32[] memory proof2 = new bytes32[](3);
        proof2[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);
        proof2[1] = bytes32(0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0);
        proof2[2] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000005);
        root = bytes32(0x3856185f708a95a4cef51f6538ed3ea849702a46e020430070ac99c94a831c58);
        leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
        assertTrue(MerkleProof.verify(proof2, root, leaf));

        bytes32[] memory proof3 = new bytes32[](3);
        proof3[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000004);
        proof3[1] = bytes32(0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0);
        proof3[2] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000005);
        root = bytes32(0x3856185f708a95a4cef51f6538ed3ea849702a46e020430070ac99c94a831c58);
        leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        assertTrue(MerkleProof.verify(proof3, root, leaf));

        bytes32[] memory proof4 = new bytes32[](3);
        proof4[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        proof4[1] = bytes32(0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0);
        proof4[2] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000005);
        root = bytes32(0x3856185f708a95a4cef51f6538ed3ea849702a46e020430070ac99c94a831c58);
        leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000004);
        assertTrue(MerkleProof.verify(proof4, root, leaf));

        bytes32[] memory proof5 = new bytes32[](1);
        proof5[0] = bytes32(0x0c48ddc2b8d6d066c52fc608d4d0254f418bea6cd8424fe95390ac87323f9c9f);
        root = bytes32(0x3856185f708a95a4cef51f6538ed3ea849702a46e020430070ac99c94a831c58);
        leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000005);
        assertTrue(MerkleProof.verify(proof5, root, leaf));
    }

    function test_simple_deep_nested_merkle() public {
        bytes32[] memory proof = new bytes32[](5);
        proof[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
        proof[1] = bytes32(0x2e174c10e159ea99b867ce3205125c24a42d128804e4070ed6fcc8cc98166aa0);
        proof[2] = bytes32(0x027d4202008bf9d080d976936bdbedf33e9934bc0b1745fd5712497536a83bd9);
        proof[3] = bytes32(0xfe80662db288f0dd9570b3f328230d82aed77131c5b2ca12e6ff8862f5676018);
        proof[4] = bytes32(0x62c5d723f64d0a40a5e7e1155936334a2e84fb4edafd16a6045d8b502c0e3d99);
        bytes32 root = bytes32(0x829aa29a4940648ff39373741e8cf185ad9cff8af1529623eacce5b528406827);
        bytes32 leaf = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);
        assertTrue(MerkleProof.verify(proof, root, leaf));
    }
}
