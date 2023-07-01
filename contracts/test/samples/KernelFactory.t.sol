// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {Kernel} from "@/contracts/samples/Kernel.sol";
import {KernelFactory} from "@/contracts/samples/KernelFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract TestKernelFactory is BaseFactoryTest {
    // EntryPoint from eth-inifinitism
    EntryPoint entryPoint;
    // Kernel from eth-inifinitism
    Kernel account;
    // KernelFactory from eth-inifinitism
    KernelFactory factory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the KernelFactory w/ EntryPoint
        factory = new KernelFactory(entryPoint);
        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(address(this), 0);
    }

    function test_simple_upgradeToUUPS() public {
        // Deploy new version of Kernel
        Kernel accountV2 = new Kernel(entryPoint);
        // Check that the account is the new implementation
        _upgradeToUUPS(address(account), address(accountV2));
    }

    function test_simple_upgradeToImmutable() public {
        // Check that upgrade to immutable works
        _upgradeToImmutable(address(account));
    }

    function test_simple_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }
}
