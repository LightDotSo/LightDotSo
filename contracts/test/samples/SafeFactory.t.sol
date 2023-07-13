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
import {SafeL3} from "@/contracts/samples/SafeL3.sol";
import {SafeFactory} from "@/contracts/samples/SafeFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract SafeFactoryTest is BaseFactoryTest {
    // Event emitted when not called by self
    // From: https://github.com/0xsequence/wallet-contracts/blob/3b0ea33499477d7f9d9f2544368bcbbe54a87ca2/contracts/modules/commons/ModuleSelfAuth.sol#L6
    error OnlySelfAuth(address _sender, address _self);

    // EntryPoint from eth-inifinitism
    EntryPoint private entryPoint;
    // SafeL3 from eth-inifinitism
    SafeL3 private account;
    // SafeFactory from eth-inifinitism
    SafeFactory private factory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the SafeFactory w/ EntryPoint
        factory = new SafeFactory(entryPoint);
        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(bytes32(uint256(1)), 0);
    }

    function test_safe_predictedCreateAccount() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(bytes32(uint256(1)), 0);
        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
        // Get the immutable implementation in the factory
        SafeL3 implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the SafeL3
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(implementation));
    }

    function test_safe_revertDisabledUpgradeToUUPS() public {
        // Deploy new version of SafeL3
        SafeL3 accountV2 = new SafeL3(entryPoint);
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSelector(OnlySelfAuth.selector, address(this), address(account)));
        // Check that the account is the new implementation
        _upgradeTo(address(account), address(accountV2));
    }

    function test_safe_revertDisabledUpgradeToImmutable() public {
        // Deploy the Immutable
        _deployImmutable();
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSelector(OnlySelfAuth.selector, address(this), address(account)));
        // Check that upgrade to immutable works
        _upgradeTo(address(account), address(immutableProxy));
    }

    function test_safe_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }

    function test_safe_noInitializeTwice() public {
        // Check that the account is not initializable twice
        _noInitializeTwice(address(account), abi.encodeWithSignature("initialize(bytes32)", bytes32(uint256(0))));
    }
}
