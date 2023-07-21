// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract ImageHashUpgradabliityIntegrationTest is BaseIntegrationTest {
    /// Tests that the transaction reverts when the signature is invalid
    function test_revertWhenSignatureInvalid_updateImageHash() public {
        // Set the image hash to a random value
        bytes32 hash = bytes32(uint256(1));

        // Obtain the user operation w/ signature
        UserOperation[] memory ops = entryPoint.signPackUserOp(
            lightWalletUtils,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", hash)
            ),
            userKey
        );

        // Set the signature to an invalid value
        ops[0].signature = bytes("invalid");

        // Handle the user operation
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the transaction reverts when the image hash is zero
    function test_revertWhenImageHashZero_updateImageHash() public {
        // Set the image hash to a random value
        bytes32 hash = bytes32(uint256(0));

        // Expect revert w/ `ImageHashIsZero` when the image hash is zero
        vm.prank(address(entryPoint));
        vm.expectRevert(bytes("ImageHashIsZero"));
        (bool ok,) = address(account).call(
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", hash)
            )
        );

        // Expect that the transaction reverts
        assertFalse(ok);
        // Expect that the image hash is not zero
        assertFalse(account.imageHash() == hash);
    }

    /// Tests that the account can correctly update its image hash
    function test_updateImageHash() public {
        // Set the image hash to a random value
        bytes32 hash = bytes32(uint256(1));

        // Expect emit the `ImageHashUpdated` event and handle the user operation
        vm.expectEmit(true, true, true, true);
        emit ImageHashUpdated(hash);
        UserOperation[] memory ops = entryPoint.signPackUserOp(
            lightWalletUtils,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", hash)
            ),
            userKey
        );

        // Handle the user operation
        entryPoint.handleOps(ops, beneficiary);

        // Expect that the image hash is the updated one
        assertEq(account.imageHash(), hash);
    }
}
