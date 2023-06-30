// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@/contracts/core/EntryPoint.sol";
import "@/contracts/proxies/ImmutableProxy.sol";
import "@/contracts/samples/SimpleAccount.sol";
import "@/contracts/samples/SimpleAccountFactory.sol";
import "@/test/utils/ProxyUtils.sol";
import "forge-std/Test.sol";

contract TestSimpleAccountFactory is Test {
    // EntryPoint from eth-inifinitism
    EntryPoint entryPoint;
    // SimpleAccount from eth-inifinitism
    SimpleAccount account;
    // SimpleAccountFactory from eth-inifinitism
    SimpleAccountFactory factory;

    // Testing utility contract
    ProxyUtils proxyUtils;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the SimpleAccount w/ EntryPoint
        account = new SimpleAccount(entryPoint);
        // Deploy the SimpleAccountFactory w/ EntryPoint
        factory = new SimpleAccountFactory(entryPoint);

        // Deploy the ProxyUtils contract for testing
        proxyUtils = new ProxyUtils();
    }

    function test_predictedCreateAccount() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(address(this), 0);
        // Create the account using the factory w/ nonce 0
        SimpleAccount createdAccount = factory.createAccount(address(this), 0);
        // Assert that the predicted address matches the created account
        assertEq(predicted, address(createdAccount));
        // Get the immutable implementation in the factory
        SimpleAccount implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the SimpleAccount
        assertEq(proxyUtils.getProxyImplementation(address(createdAccount)), address(implementation));
    }

    function test_UUPSUpgradeTo() public {
        // Create the account using the factory w/ nonce 0
        SimpleAccount createdAccount = factory.createAccount(address(this), 0);
        // Deploy new version of SimpleAccount
        SimpleAccount accountV2 = new SimpleAccount(entryPoint);
        // Upgrade the account to the new version
        createdAccount.upgradeTo(address(accountV2));
        // Assert that the account is now the new version
        assertEq(proxyUtils.getProxyImplementation(address(createdAccount)), address(accountV2));
    }

    function test_UpgradeToImmutable() public {
        // Create the account using the factory w/ nonce 0
        SimpleAccount createdAccount = factory.createAccount(address(this), 0);
        // Deploy new version of SimpleAccount
        ImmutableProxy immutableProxy = new ImmutableProxy();
        // Upgrade the account to the immutable version
        createdAccount.upgradeTo(address(immutableProxy));
        // Assert that the account is now immutable
        assertEq(proxyUtils.getProxyImplementation(address(createdAccount)), address(immutableProxy));
        // Assert that the account cannot be upgraded again
        vm.expectRevert("Upgrades are disabled");
        createdAccount.upgradeTo(address(account));
    }

    function test_noProxyAdmin() public {
        // Create the account using the factory w/ nonce 0
        SimpleAccount createdAccount = factory.createAccount(address(this), 0);
        // Assert that the account has no proxy admin
        assertEq(proxyUtils.getProxyAdmin(address(createdAccount)), address(0));
    }
}
