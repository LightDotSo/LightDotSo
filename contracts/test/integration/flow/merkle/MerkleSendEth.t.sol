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

pragma solidity ^0.8.27;

import {Merkle} from "murky/Merkle.sol";
import "solidity-bytes-utils/BytesLib.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

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
    function test_WhenTheSignatureIsValidWithAMerkleTree() public {
        // Example UserOperation to send 0 ETH to the address one
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);

        // Get the first userOp
        PackedUserOperation memory op = ops[0];

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
        bytes memory merkleSignature =
            entryPoint.signPackMerkleRoot(vm, address(account), root, userKey, weight, threshold, checkpoint);
        bytes memory signatureAndProof = abi.encodePacked(hex"04", abi.encode(root, proof, merkleSignature));

        // Attempt to decode the signature and proof
        (bytes32 merkleTreeRoot, bytes32[] memory merkleProof, bytes memory merkleDecodedSignature) =
            abi.decode(signatureAndProof.slice(1, signatureAndProof.length - 1), (bytes32, bytes32[], bytes));

        // Assert that the merkle tree root is the same
        assertEq(merkleTreeRoot, root);
        // solhint-disable-next-line no-console
        console.logBytes32(merkleTreeRoot);
        assertEq(merkleProof[0], proof[0]);
        // solhint-disable-next-line no-console
        console.logBytes32(merkleProof[0]);

        // Assert that the signature and proof is the correct length
        assertEq(merkleSignature, merkleDecodedSignature);
        assertEq(signatureAndProof.length, 289);
        // solhint-disable-next-line no-console
        console.logBytes(signatureAndProof);

        // Assert that the signature after the proof is the same
        assertEq(signatureAndProof.slice(193, merkleSignature.length), merkleSignature);
        // console.logBytes(signature);
        uint256 offset = 193;
        // solhint-disable-next-line no-console
        console.logBytes(signatureAndProof.slice(offset, merkleSignature.length));
        // solhint-disable-next-line no-console
        console.logBytes(merkleSignature);

        // Set the signature and proof
        op.signature = signatureAndProof;

        // it should transfer the ETH to the recipient
        entryPoint.handleOps(ops, beneficiary);

        // Attempt to decode the signature and proof
        (bytes32 decodedMerkleRoot, bytes32[] memory decodedMerkleProofs, bytes memory decodedSignature) = abi.decode(
            hex"9ca174e7f8cbb8170c135f1a5a9a5ad293916907ef44f87b4f960278f0a686b2000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000162b3593f95d92384963531ae52b0cf95d43d0964939e71ad51a76b80483733100000000000000000000000000000000000000000000000000000000000000061020001000000000001158aa56ea34c217ad11df23a1ee6f0fe36e41bbb34f1e403220604b782b19c7e17e63ad5fe3484b7305fd8c8d4bae55329f5b7dbee5c7807b9f88e4463c1339f1b0201017f4c8bd0acc303599a1ae92414b055514ffb6f8100000000000000000000000000000000000000000000000000000000000000",
            (bytes32, bytes32[], bytes)
        );
        // solhint-disable-next-line no-console
        console.logBytes32(decodedMerkleRoot);
        // solhint-disable-next-line no-console
        console.logBytes32(decodedMerkleProofs[0]);
        // solhint-disable-next-line no-console
        console.logBytes(decodedSignature);

        // Assert that the balance of the account is 1
        assertEq(address(1).balance, 1);
    }
}
