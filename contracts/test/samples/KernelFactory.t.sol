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
import "@/contracts/samples/KernelECDSAFactory.sol";
import {EIP1967Proxy} from "@/contracts/samples/KernelProxy.sol";
import {KernelFactory} from "@/contracts/samples/KernelFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract KernelFactoryTest is BaseFactoryTest {
    // EntryPoint from eth-inifinitism
    EntryPoint private entryPoint;
    // Kernel from kernel
    EIP1967Proxy private account;
    // KernelFactory from kernel
    KernelFactory private factory;
    // Validator from kernel
    ECDSAValidator private validator;
    // ECDSAFactory from kernel
    ECDSAKernelFactory private ecdsaFactory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the KernelFactory w/ EntryPoint
        factory = new KernelFactory(entryPoint);
        // Deploy the default validator
        validator = new ECDSAValidator();
        // Deploy the default ECDSAFactory
        ecdsaFactory = new ECDSAKernelFactory(factory, validator, entryPoint);

        account = ecdsaFactory.createAccount(address(1), 0);
    }

    function test_kernel_upgradeToUUPS() public {
        // Deploy new version of Kernel
        Kernel accountV2 = new Kernel(entryPoint);
        // Start the prank
        vm.startPrank(address(account));
        // Check that the account is the new implementation
        _upgradeToUUPS(address(account), address(accountV2));
        // Stop the prank
        vm.stopPrank();
    }

    function test_kernel_upgradeToImmutable() public {
        // Start the prank
        vm.startPrank(address(account));
        // Check that upgrade to immutable works
        _upgradeToImmutable(address(account));
        // Stop the prank
        vm.stopPrank();
    }

    function test_kernel_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }
}
