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

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
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

    /// Tests that the factory reverts when trying to upgrade from outside address
    function test_revertWhenNotSelf_upgradeTo() public {
        // Deploy new version of LightWallet
        LightWallet accountV2 = new LightWallet(entryPoint);
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("OnlySelfAuth(address,address)", address(this), address(account)));
        // Check that the account is the new implementation
        _upgradeTo(address(account), address(accountV2));
    }

    /// Tests that the account can upgrade to a v2 version of LightWallet
    function test_upgradeToV2() public {
        // Deploy new version of LightWallet to test upgrade to
        LightWallet accountV2 = new LightWallet(entryPoint);

        // Example UserOperation to update the account to immutable address one
        UserOperation[] memory ops = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("upgradeTo(address)", address(accountV2))
            ),
            userKey,
            "",
            weight,
            threshold,
            checkpoint
        );
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the account is now immutable
        assertEq(getProxyImplementation(address(account)), address(accountV2));
    }

    /// Tests that the factory reverts when trying to upgrade to an immutable address
    function test_revertWhenImmutable_upgradeToImmutable() public {
        // Example UserOperation to update the account to immutable address one
        UserOperation[] memory ops = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("upgradeTo(address)", address(immutableProxy))
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
        UserOperation[] memory opsv2 = entryPoint.signPackUserOps(
            vm,
            address(account),
            abi.encodeWithSignature("upgradeTo(address)", address(accountV2)),
            userKey,
            "",
            weight,
            threshold,
            checkpoint
        );
        vm.expectRevert();
        entryPoint.handleOps(opsv2, beneficiary);
    }
}
