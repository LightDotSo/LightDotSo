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
import {TimelockControllerUpgradeable} from "@/contracts/LightTimelockController.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Integration tests for `LightWallet` sending ETH
contract TimelockProposalExecuteEthIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event CallScheduled(
        bytes32 indexed id,
        uint256 indexed index,
        address target,
        uint256 value,
        bytes data,
        bytes32 predecessor,
        uint256 delay
    );

    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // Internal operational to send
    bytes32 internal operationId;

    // Internal operational batch to send
    bytes32 internal operationBatch;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();

        // Set the operational callData
        operationId = timelock.hashOperation(address(1), 1, bytes(""), bytes32(0), bytes32(0));

        // Set the targets
        address[] memory targets = new address[](1);
        targets[0] = address(1);

        // Set the values
        uint256[] memory values = new uint256[](1);
        values[0] = 1;

        // Set the datas
        bytes[] memory datas = new bytes[](1);
        datas[0] = bytes("");

        // Set the operational batch
        operationBatch = timelock.hashOperationBatch(targets, values, datas, bytes32(0), bytes32(0));
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account can correctly transfer ETH
    function test_timelock_execute() public {
        // Schedule the operation
        vm.prank(address(account));
        vm.expectEmit(true, true, false, false);
        emit CallScheduled(operationId, 0, address(1), 1, bytes(""), bytes32(0), uint256(300));
        timelock.schedule(address(1), 1, bytes(""), bytes32(0), bytes32(0), uint256(300));

        // Gives timelock address some eth
        vm.deal(address(timelock), 1);

        // Executes the operation
        vm.warp(block.timestamp + 300);
        vm.prank(address(lightProtocolController));
        timelock.execute(address(1), 1, bytes(""), bytes32(0), bytes32(0));
    }

    /// Tests that the timelock will fail when the timelock is not yet ready
    function test_revertWhenNotReady_execute() public {
        // Schedule the operation
        vm.prank(address(account));
        vm.expectEmit(true, true, false, false);
        emit CallScheduled(operationId, 0, address(1), 1, bytes(""), bytes32(0), uint256(300));
        timelock.schedule(address(1), 1, bytes(""), bytes32(0), bytes32(0), uint256(300));

        // Executes the operation
        vm.prank(address(lightProtocolController));
        vm.expectRevert();
        // vm.expectRevert(TimelockControllerUpgradeable.TimelockUnexpectedOperationState.selector);
        timelock.execute(address(1), 1, bytes(""), bytes32(0), bytes32(0));
    }

    /// Tests that the account can correctly transfer ETH
    function test_timelock_executeBatch() public {
        // Set the targets
        address[] memory targets = new address[](1);
        targets[0] = address(1);

        // Set the values
        uint256[] memory values = new uint256[](1);
        values[0] = 1;

        // Set the datas
        bytes[] memory datas = new bytes[](1);
        datas[0] = bytes("");

        // Schedule the operation
        vm.prank(address(account));
        vm.expectEmit(true, true, false, false);
        emit CallScheduled(operationBatch, 0, address(1), 1, bytes(""), bytes32(0), uint256(300));
        timelock.scheduleBatch(targets, values, datas, bytes32(0), bytes32(0), uint256(300));

        // Gives timelock address some eth
        vm.deal(address(timelock), 1);

        // Executes the operation
        vm.warp(block.timestamp + 300);
        vm.prank(address(lightProtocolController));
        timelock.executeBatch(targets, values, datas, bytes32(0), bytes32(0));
    }
}
