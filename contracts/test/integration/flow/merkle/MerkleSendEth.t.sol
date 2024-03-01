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

// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import {Merkle} from "murky/Merkle.sol";
import "solidity-bytes-utils/BytesLib.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using BytesLib for bytes;
using ERC4337Utils for EntryPoint;

/// @notice Integration tests for `LightWallet` sending ETH
contract MerkleSendEthIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // Internal operational callData to send
    bytes internal callData;

    // Merkle utility
    Merkle internal m;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();

        // Set the operational callData
        callData = abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""));

        // Construct the merkle utility w/ murky
        m = new Merkle();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account can correctly transfer ETH
    function test_merkle_transferEth() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);

        // Get the first userOp
        UserOperation memory op = ops[0];

        // Get the userOp hash
        bytes32 userOpHash = entryPoint.getUserOpHash(op);

        // Construct the merkle proof
        bytes32[] memory data = new bytes32[](2);
        data[0] = bytes32(uint256(1));
        data[1] = userOpHash;
        bytes32 root = m.getRoot(data);

        // Get the proof
        bytes32[] memory proof = m.getProof(data, 1);

        // Verify the proof
        bool verified = m.verifyProof(root, proof, data[1]);
        assertTrue(verified);

        // Encode the signature and proof
        bytes memory signature = op.signature;
        bytes memory signatureAndProof = abi.encodePacked(hex"04", abi.encode(root, proof, signature));

        // Attempt to decode the signature and proof
        (bytes32 merkleTreeRoot, bytes32[] memory merkleProof,) =
            abi.decode(signatureAndProof.slice(1, signatureAndProof.length - 1), (bytes32, bytes32[], bytes));

        // Assert that the merkle tree root is the same
        assertEq(merkleTreeRoot, root);
        assertEq(merkleProof[0], proof[0]);

        // Assert that the signature and proof is the correct length
        assertEq(signatureAndProof.length, 289);

        // ops[0].signature = signatureAndProof;

        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the account is 1
        assertEq(address(1).balance, 1);
    }
}
