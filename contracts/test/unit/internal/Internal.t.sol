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

import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";

/// @notice Unit tests for `LightWallet` for compatibility w/ ERC-165
contract InternalUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // Internal operational callData to send
    bytes internal callData;

    // Internal array of addresses to send ETH to
    address[] internal callAddresses;
    // Internal array of values to send ETH to
    uint256[] internal callValues;
    // Internal array of callDatas to send ETH to
    bytes[] internal callDatas;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base tests
        BaseTest.setUp();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account reverts when the array lengths are invalid
    function test_revertWhenInvalidLength_executeBatch() public {
        // Create the account using the factory w/ hash 1, nonce 0
        _testCreateAccountWithNonceZero();

        // Set the callData to transfer ETH to the address one, two, and three
        callAddresses = new address[](3);
        callAddresses[0] = address(1);
        callAddresses[1] = address(2);
        callAddresses[2] = address(3);

        callValues = new uint256[](0);

        callDatas = new bytes[](1);
        callDatas[0] = bytes("");

        // Expect revert when calling executeBatch w/ wrong array lengths
        vm.prank(address(entryPoint));
        vm.expectRevert(bytes("wrong array lengths"));
        address(account).call(
            abi.encodeWithSelector(LightWallet.executeBatch.selector, callAddresses, callValues, callDatas)
        );
    }
}
