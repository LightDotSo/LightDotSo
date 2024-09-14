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

pragma solidity ^0.8.18;

import {IERC1155} from "@openzeppelin/contracts-v4.9/token/ERC1155/IERC1155.sol";
import {MockERC1155} from "solmate/test/utils/mocks/MockERC1155.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Integration tests for `LightWallet` sending ERC1155
contract BatchSendERC1155IntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // ERC1155 nft to send
    MockERC1155 internal multi;
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

        // Deploy a new MockERC1155
        multi = new MockERC1155();

        // Mint 10 tokens of id of 1 to the account
        multi.mint(address(account), 1, 10, "");
        assertEq(multi.balanceOf(address(account), 1), 10);

        // Set the callData to transfer nfts to the address one, two, and three
        callAddresses = new address[](3);
        callAddresses[0] = address(multi);
        callAddresses[1] = address(multi);
        callAddresses[2] = address(multi);

        callValues = new uint256[](0);

        callDatas = new bytes[](3);
        callDatas[0] =
            abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(1), 1, 1, "");
        callDatas[1] =
            abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(2), 1, 1, "");
        callDatas[2] =
            abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(3), 1, 1, "");

        // Set the operational callData
        callData = abi.encodeWithSelector(LightWallet.executeBatch.selector, callAddresses, callValues, callDatas);
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account revert when sending ERC1155 from a non-entrypoint
    function test_revertWhenNotEntrypoint_batchTransferERC1155() public {
        vm.expectRevert(bytes("account: not from EntryPoint"));
        (bool success,) = address(account).call(callData);
        assertEq(success, true);
    }

    /// Tests that the account can correctly transfer ERC1155
    function test_revertWhenInvalidSignature_batchTransferERC1155() public {
        // Example UserOperation to send 0 ERC1155 to the address one
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        ops[0].signature = bytes("invalid");
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the account can correctly transfer ERC1155
    function test_batchTransferERC1155() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the corresponding destinations are correct
        assertEq(multi.balanceOf(address(1), 1), 1);
        assertEq(multi.balanceOf(address(1), 1), 1);
        assertEq(multi.balanceOf(address(1), 1), 1);
    }
}
