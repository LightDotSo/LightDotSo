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

/// @notice Integration tests for `LightWallet` batch sending ETH
contract BatchSendEthIntegrationTest is BaseIntegrationTest {
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
        // Setup the base factory tests
        BaseIntegrationTest.setUp();

        // Set the callData to transfer ETH to the address one, two, and three
        callAddresses = new address[](3);
        callAddresses[0] = address(1);
        callAddresses[1] = address(2);
        callAddresses[2] = address(3);

        callValues = new uint256[](3);
        callValues[0] = uint256(1);
        callValues[1] = uint256(2);
        callValues[2] = uint256(3);

        callDatas = new bytes[](3);
        callDatas[0] = bytes("");
        callDatas[1] = bytes("");
        callDatas[2] = bytes("");

        // Set the operational callData
        callData = abi.encodeWithSelector(LightWallet.executeBatch.selector, callAddresses, callValues, callDatas);
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account revert when sending ETH from a non-entrypoint
    function test_revertWhenNotEntrypoint_batchTransferEth() public {
        vm.expectRevert(bytes("account: not from EntryPoint"));
        (bool success,) = address(account).call(callData);
        assertEq(success, true);
    }

    /// Tests that the account can correctly transfer ETH
    function test_revertWhenInvalidSignature_batchTransferEth() public {
        // Example UserOperation to send 0 ETH to the address one
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        ops[0].signature = bytes("invalid");
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the account can correctly transfer ETH
    function test_batchTransferEth() public {
        // Example UserOperation to send 0 ETH to the address one
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the corresponding balance of the accounts are correct
        assertEq(address(1).balance, 1);
        assertEq(address(2).balance, 2);
        assertEq(address(3).balance, 3);
    }
}
