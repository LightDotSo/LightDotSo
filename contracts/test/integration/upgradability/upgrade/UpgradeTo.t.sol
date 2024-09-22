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
import {LightTimelockController} from "@/contracts/LightTimelockController.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract UpgradeToIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account reverts when the caller is not self
    function test_WalletRevertWhen_TheCallerIsNotSelf() external {
        // it should revert
        // it should revert with a {OnlySelfAuth} error
    }

    /// Tests that the account can upgrade to a v2 version of LightWallet
    function test_WalletWhenTheCallerIsSelf() external {
        // Deploy new version of LightWallet to test upgrade to
        LightWallet accountV2 = new LightWallet(entryPoint);

        // Example UserOperation to update the account to immutable address one
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("upgradeToAndCall(address,bytes)", address(accountV2), bytes(""))
            ),
            userKey,
            "",
            weight,
            threshold,
            checkpoint
        );

        // it should upgrade to a new implementation
        // it should have the correct implementation address
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the account is now the new implementation
        assertEq(getProxyImplementation(address(account)), address(accountV2));
    }

    /// Tests that the factory reverts when trying to upgrade to an immutable address
    function test_WalletWhenTheImplementationIsImmutable() public {
        // Example UserOperation to update the account to immutable address one
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("upgradeToAndCall(address,bytes)", address(immutableProxy), bytes(""))
            ),
            userKey,
            "",
            weight,
            threshold,
            checkpoint
        );
        entryPoint.handleOps(ops, beneficiary);
        // Deploy new version of LightWallet to test upgrade to
        LightWallet accountV2 = new LightWallet(entryPoint);

        // Example UserOperation to update the account to immutable address one
        PackedUserOperation[] memory opsv2 = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSignature("upgradeToAndCall(address,bytes)", address(accountV2), bytes("")),
            userKey,
            "",
            weight,
            threshold,
            checkpoint
        );

        // it should not be able to upgrade to a new implementation
        // it should revert when attempting to upgrade
        vm.expectRevert();
        entryPoint.handleOps(opsv2, beneficiary);
    }

    /// Tests that the factory reverts when trying to upgrade from outside address
    function test_TimelockRevertWhen_TheCallerIsNotSelf() public {
        // Deploy new version of LightTimelockController
        LightTimelockController timelockV2 = new LightTimelockController();

        // it should revert
        // it should revert with a {OnlySelfAuth} error
        vm.expectRevert(abi.encodeWithSignature("OnlySelfAuth(address,address)", address(this), address(timelock)));
        // Revert for conventional upgrades w/o signature
        // Check that the account is the new implementation
        _upgradeTo(address(timelock), address(timelockV2));
    }

    /// Tests that the timelock can upgrade to a v2 version of LightTimelockController
    function test_TimelockWhenTheCallerIsSelf() public {
        // Deploy new version of LightTimelockController to test upgrade to
        LightTimelockController timelockV2 = new LightTimelockController();

        // it should upgrade to a new implementation
        // it should have the correct implementation address
        vm.prank(address(timelock));
        timelock.upgradeToAndCall(address(timelockV2), bytes(""));

        // Assert that the timelock is now immutable
        assertEq(getProxyImplementation(address(timelock)), address(timelockV2));
    }

    function test_TimelockWhenTheImplementationIsImmutable() public {
        // Deploy new version of LightTimelockController to test upgrade to
        LightTimelockController timelockV2 = new LightTimelockController();

        vm.prank(address(timelock));
        timelock.upgradeToAndCall(address(immutableProxy), bytes(""));

        // it should not be able to upgrade to a new implementation
        // it should revert when attempting to upgrade
        vm.prank(address(timelock));
        vm.expectRevert();
        timelock.upgradeToAndCall(address(timelockV2), bytes(""));
    }
}
