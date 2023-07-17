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
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract LightWalletFactoryTest is BaseFactoryTest {
    // EntryPoint from eth-inifinitism
    EntryPoint private entryPoint;
    // LightWallet from eth-inifinitism
    LightWallet private account;
    // LightWalletFactory from eth-inifinitism
    LightWalletFactory private factory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);
        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(bytes32(uint256(1)), 0);
    }

    function test_light_predictedCreateAccount() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(bytes32(uint256(1)), 0);
        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
        // Get the immutable implementation in the factory
        LightWallet implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the LightWallet
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(implementation));
    }

    function test_light_revertDisabledUpgradeToUUPS() public {
        // Deploy new version of LightWallet
        LightWallet accountV2 = new LightWallet(entryPoint);
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("OnlySelfAuth(address,address)", address(this), address(account)));
        // Check that the account is the new implementation
        _upgradeTo(address(account), address(accountV2));
    }

    function test_light_revertDisabledUpgradeToImmutable() public {
        // Deploy the Immutable
        _deployImmutable();
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("OnlySelfAuth(address,address)", address(this), address(account)));
        // Check that upgrade to immutable works
        _upgradeTo(address(account), address(immutableProxy));
    }

    function test_light_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }

    function test_light_noInitializeTwice() public {
        // Check that the account is not initializable twice
        _noInitializeTwice(address(account), abi.encodeWithSignature("initialize(bytes32)", bytes32(uint256(0))));
    }
}
