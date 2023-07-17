// Copyright (C) 2023 simplev2, Inc.
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
import {SimpleAccountV2} from "@/contracts/samples/SimpleAccountV2.sol";
import {SimpleAccountV2Factory} from "@/contracts/samples/SimpleAccountV2Factory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

/// @notice Unit tests for `SimpleAccountV2Factory`, organized by functions.
contract SimpleAccountV2FactoryTest is BaseFactoryTest {
    // EntryPoint from eth-inifinitism
    EntryPoint private entryPoint;
    // SimpleAccountV2 from eth-inifinitism
    SimpleAccountV2 private account;
    // SimpleAccountV2Factory from eth-inifinitism
    SimpleAccountV2Factory private factory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the SimpleAccountV2Factory w/ EntryPoint
        factory = new SimpleAccountV2Factory(entryPoint);
        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(address(this), 0);
    }

    function test_simplev2_predictedCreateAccount() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(address(this), 0);
        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
        // Get the immutable implementation in the factory
        SimpleAccountV2 implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the SimpleAccountV2
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(implementation));
    }

    function test_simplev2_upgradeToUUPS() public {
        // Deploy new version of SimpleAccountV2
        SimpleAccountV2 accountV2 = new SimpleAccountV2(entryPoint);
        // Check that the account is the new implementation
        _upgradeToUUPS(address(account), address(accountV2));
    }

    function test_simplev2_upgradeToImmutable() public {
        // Check that upgrade to immutable works
        _upgradeToImmutable(address(account));
    }

    function test_simplev2_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }

    function test_simplev2_noInitializeTwice() public {
        // Check that the account is not initializable twice
        _noInitializeTwice(address(account), abi.encodeWithSignature("initialize(address)", address(this)));
    }
}
