// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import "@/contracts/samples/KernelECDSAFactory.sol";
import {EIP1967Proxy} from "@/contracts/samples/KernelProxy.sol";
import {KernelFactory} from "@/contracts/samples/KernelFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract TestKernelFactory is BaseFactoryTest {
    // EntryPoint from eth-inifinitism
    EntryPoint entryPoint;

    // Kernel from kernel
    EIP1967Proxy account;
    // KernelFactory from kernel
    KernelFactory factory;
    // Validator from kernel
    ECDSAValidator validator;
    // ECDSAFactory from kernel
    ECDSAKernelFactory ecdsaFactory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the KernelFactory w/ EntryPoint
        factory = new KernelFactory(entryPoint);
        // Deploy the default validator
        validator = new ECDSAValidator();
        // Deploy the default ECDSAFactory
        ecdsaFactory = new ECDSAKernelFactory(factory, validator, entryPoint);

        account = ecdsaFactory.createAccount(address(0), 0);
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
