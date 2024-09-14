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

/// @notice Integration tests for `LightWallet` sending ETH
contract SendEthIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // Internal operational callData to send
    bytes internal callData;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();

        // Set the operational callData
        callData = abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""));
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account revert when sending ETH from a non-entrypoint
    function test_revertWhenNotEntrypoint_transferEth() public {
        vm.expectRevert(bytes("account: not from EntryPoint"));
        (bool success,) = address(account).call(callData);
        assertEq(success, true);
    }

    /// Tests that the account can correctly transfer ETH
    function test_revertWhenInvalidSignature_transferEth() public {
        // Example UserOperation to send 0 ETH to the address one
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        ops[0].signature = bytes("invalid");
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the account can correctly transfer ETH
    function test_transferEth() public {
        // Example UserOperation to send 0 ETH to the address one
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the account is 1
        assertEq(address(1).balance, 1);
    }
}
