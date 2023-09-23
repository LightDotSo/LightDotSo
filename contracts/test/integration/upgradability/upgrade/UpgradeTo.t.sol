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
            lightWalletUtils,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("upgradeTo(address)", address(accountV2))
            ),
            userKey,
            ""
        );
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the account is now immutable
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(accountV2));
    }

    /// Tests that the factory reverts when trying to upgrade to an immutable address
    function test_revertWhenImmutable_upgradeToImmutable() public {
        // Example UserOperation to update the account to immutable address one
        UserOperation[] memory ops = entryPoint.signPackUserOps(
            lightWalletUtils,
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("upgradeTo(address)", address(immutableProxy))
            ),
            userKey,
            ""
        );
        entryPoint.handleOps(ops, beneficiary);
        // Deploy new version of LightWallet to test upgrade to
        LightWallet accountV2 = new LightWallet(entryPoint);

        // Example UserOperation to update the account to immutable address one
        UserOperation[] memory opsv2 = entryPoint.signPackUserOps(
            lightWalletUtils,
            address(account),
            abi.encodeWithSignature("upgradeTo(address)", address(accountV2)),
            userKey,
            ""
        );
        vm.expectRevert();
        entryPoint.handleOps(opsv2, beneficiary);
    }
}
