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

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Integration tests for `LightWallet` batch sending ERC20
contract BatchSendERC20IntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // ERC20 token to send
    MockERC20 internal token;
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

        // Deploy a new MockERC20
        token = new MockERC20("Test", "TEST", 18);

        // Mint 1e18 ERC20s to the account
        token.mint(address(account), 1e18);
        assertEq(token.balanceOf(address(account)), 1e18);

        // Set the callData to transfer tokens to the address one, two, and three
        callAddresses = new address[](3);
        callAddresses[0] = address(token);
        callAddresses[1] = address(token);
        callAddresses[2] = address(token);

        callValues = new uint256[](0);

        callDatas = new bytes[](3);
        callDatas[0] = abi.encodeWithSelector(IERC20.transfer.selector, address(1), 1);
        callDatas[1] = abi.encodeWithSelector(IERC20.transfer.selector, address(2), 2);
        callDatas[2] = abi.encodeWithSelector(IERC20.transfer.selector, address(3), 3);

        // Set the operational callData
        callData = abi.encodeWithSelector(
            LightWallet.executeBatch.selector, callAddresses, callValues, callDatas
        );
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account revert when sending ERC20 from a non-entrypoint
    function test_RevertWhen_TheSenderIsNotEntrypoint() public {
        // it should revert
        vm.expectRevert(bytes("account: not from EntryPoint"));
        (bool success,) = address(account).call(callData);
        assertEq(success, true);
    }

    modifier whenTheSenderIsEntrypoint() {
        _;
    }

    /// Tests that the account can correctly transfer ERC20
    function test_RevertWhen_TheSignatureIsInvalid() external whenTheSenderIsEntrypoint {
        // Example UserOperation to send 0 ERC20 to the address one
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm, address(account), callData, userKey, "", weight, threshold, checkpoint
        );
        ops[0].signature = bytes("invalid");

        // it should revert
        // it should revert with a {InvalidSignature} error
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the account can correctly transfer ERC20
    function test_WhenTheSignatureIsValid() external whenTheSenderIsEntrypoint {
        // Example UserOperation to send 0 ETH to the address one
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm, address(account), callData, userKey, "", weight, threshold, checkpoint
        );

        // it should batch transfer the ERC20 to the recipient(s)
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the recipient(s) is correct
        assertEq(token.balanceOf(address(1)), 1);
        assertEq(token.balanceOf(address(2)), 2);
        assertEq(token.balanceOf(address(3)), 3);
    }
}
