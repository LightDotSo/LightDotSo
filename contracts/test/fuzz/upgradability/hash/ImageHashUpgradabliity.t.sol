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
import {BaseFuzzTest} from "@/test/base/BaseFuzzTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract ImageHashUpgradabliityFuzzTest is BaseFuzzTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account can correctly update its image hash
    function testFuzz_updateImageHash(bytes32 hash) public {
        // Assume that the hash is not 0
        vm.assume(hash != bytes32(0));

        // Obtain the user operation w/ signature
        UserOperation[] memory ops = entryPoint.signPackUserOps(
            lightWalletUtils,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", hash)
            ),
            userKey,
            ""
        );

        // Handle the user operation
        entryPoint.handleOps(ops, beneficiary);

        // Expect that the image hash is the updated one
        assertEq(account.imageHash(), hash);
    }
}
