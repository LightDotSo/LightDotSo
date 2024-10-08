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

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
/// @notice See `ERC1271FuzzTest` for fuzz tests
contract ImageHashUpgradabliityIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the transaction reverts when the signature is invalid
    function test_RevertWhen_TheSignatureIsInvalid() public {
        // Set the image hash to a random value
        bytes32 hash = bytes32(uint256(1));

        // Obtain the user operation w/ signature
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", hash)
            ),
            userKey,
            "",
            weight,
            threshold,
            checkpoint
        );

        // Set the signature to an invalid value
        ops[0].signature = bytes("invalid");

        // Handle the user operation
        vm.expectRevert();
        // it should revert
        entryPoint.handleOps(ops, beneficiary);
    }

    modifier whenTheSignatureIsValid() {
        _;
    }

    /// Tests that the transaction reverts when the image hash is zero
    function test_WhenTheNewImageHashIsZero() external whenTheSignatureIsValid {
        // Set the image hash to a random value
        bytes32 hash = bytes32(uint256(0));

        // Expect revert w/ `ImageHashIsZero` when the image hash is zero
        vm.prank(address(entryPoint));
        // it should revert on a {ImageHashZero} error
        vm.expectRevert(bytes("ImageHashIsZero"));
        (bool success,) = address(account).call(
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", hash)
            )
        );

        // Expect that the transaction reverts
        assertFalse(success);
        // Expect that the image hash is not zero
        assertFalse(account.imageHash() == hash);
    }

    /// Tests that the account can correctly update its image hash
    function test_WhenTheNewImageHashIsNotZero() external whenTheSignatureIsValid {
        // Set the image hash to a random value
        bytes32 hash = bytes32(uint256(1));

        // Expect emit the `ImageHashUpdated` event and handle the user operation
        vm.expectEmit(true, true, true, true);
        // it should emit a {ImageHashUpdated} event
        emit ImageHashUpdated(hash);
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", hash)
            ),
            userKey,
            "",
            weight,
            threshold,
            checkpoint
        );

        // Handle the user operation
        // it should set the new image hash
        entryPoint.handleOps(ops, beneficiary);

        // Expect that the image hash is the updated one
        assertEq(account.imageHash(), hash);
    }
}
