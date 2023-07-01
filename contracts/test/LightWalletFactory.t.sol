// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract TestLightWalletFactory is BaseFactoryTest {
    // EntryPoint from eth-inifinitism
    EntryPoint entryPoint;
    // LightWallet from eth-inifinitism
    LightWallet account;
    // LightWalletFactory from eth-inifinitism
    LightWalletFactory factory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the LightWalletFactory w/ EntryPoint
        factory = new LightWalletFactory(entryPoint);
        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(address(this), 0);
    }

    function test_light_predictedCreateAccount() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(address(this), 0);
        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
        // Get the immutable implementation in the factory
        LightWallet implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the LightWallet
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(implementation));
    }

    function test_light_upgradeToUUPS() public {
        // Deploy new version of LightWallet
        LightWallet accountV2 = new LightWallet(entryPoint);
        // Check that the account is the new implementation
        _upgradeToUUPS(address(account), address(accountV2));
    }

    function test_light_upgradeToImmutable() public {
        // Check that upgrade to immutable works
        _upgradeToImmutable(address(account));
    }

    function test_light_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }
}
