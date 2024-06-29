// Copyright 2023-2024 Light.
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

// Tests are inspired by noir-starter
// Link: https://github.com/noir-lang/noir-starter/blob/dff860c69eb235df64bfbdfe86fdc03cbc8f97cb/with-foundry/test/Starter.t.sol
// License: MIT

pragma solidity ^0.8.18;

import {UltraVerifier} from "@/circuits/contract/plonk_vk.sol";
import {LightVerifier} from "@/circuits/contract/LightVerifier.sol";
import {Test} from "forge-std/Test.sol";

/// @notice Unit tests for `LightVerifier`, organized by functions.
contract LightVerifierTest is Test {
    // UltraVerifier from noir
    UltraVerifier public ultraVerifier;
    // LightVerifier core contract
    LightVerifier public lightVerifier;

    bytes32[] public correct = new bytes32[](1);
    bytes32[] public wrong = new bytes32[](1);

    function setUp() public {
        // Deploy the UltraVerifier
        ultraVerifier = new UltraVerifier();
        // Deploy the LightVerifier w/ UltraVerifier
        lightVerifier = new LightVerifier(ultraVerifier);

        // Set the correct and wrong values
        correct[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);
        wrong[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000002);
    }

    // Tests that the verifier verifies the proof correctly
    function test_verifier_verifyProof() public {
        // Read the proof from the file
        string memory proof = vm.readLine("contracts/circuits/proofs/p.proof");
        // Parse the proof into bytes
        bytes memory proofBytes = vm.parseBytes(proof);
        // Verify that the proof is correct
        assertTrue(lightVerifier.verifyEqual(proofBytes, correct));
    }

    // Tests that the verifier reverts when the proof is wrong
    function test_verifier_wrongProof() public {
        // Expect revert
        vm.expectRevert();
        // Read the proof from the file
        string memory proof = vm.readLine("contracts/circuits/proofs/p.proof");
        // Parse the proof into bytes
        bytes memory proofBytes = vm.parseBytes(proof);
        // Revert because the proof is wrong (1 != 2)
        lightVerifier.verifyEqual(proofBytes, wrong);
    }
}
