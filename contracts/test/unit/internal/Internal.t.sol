// Copyright 2023-2024 Light
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

import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {Lightallet} from "@/contracts/Lightallet.sol";

/// @notice Unit tests for `Lightallet` for compatibility w/ ERC-165
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
        (bool success,) = address(account).call(
            abi.encodeWithSelector(Lightallet.executeBatch.selector, callAddresses, callValues, callDatas)
        );
        assertEq(success, true);
    }
}
