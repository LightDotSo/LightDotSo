// SPDX-License-Identifier: GPL-3.0

// Tests are inspired by noir-starter
// Link: https://github.com/noir-lang/noir-starter/blob/dff860c69eb235df64bfbdfe86fdc03cbc8f97cb/with-foundry/test/Starter.t.sol
// License: MIT

pragma solidity ^0.8.18;

import {UltraVerifier} from "@/circuits/contract/plonk_vk.sol";
import {LightVerifier} from "@/contracts/LightVerifier.sol";
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
