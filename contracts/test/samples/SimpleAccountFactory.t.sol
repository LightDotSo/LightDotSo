// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {SimpleAccount} from "@/contracts/samples/SimpleAccount.sol";
import {SimpleAccountFactory} from "@/contracts/samples/SimpleAccountFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract SimpleAccountFactoryTest is BaseFactoryTest {
    // EntryPoint from eth-inifinitism
    EntryPoint private entryPoint;
    // SimpleAccount from eth-inifinitism
    SimpleAccount private account;
    // SimpleAccountFactory from eth-inifinitism
    SimpleAccountFactory private factory;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the SimpleAccountFactory w/ EntryPoint
        factory = new SimpleAccountFactory(entryPoint);
        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(address(this), 0);
    }

    function test_simple_predictedCreateAccount() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(address(this), 0);
        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
        // Get the immutable implementation in the factory
        SimpleAccount implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the SimpleAccount
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(implementation));
    }

    function test_simple_upgradeToUUPS() public {
        // Deploy new version of SimpleAccount
        SimpleAccount accountV2 = new SimpleAccount(entryPoint);
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

    function test_simple_noInitializeTwice() public {
        // Check that the account is not initializable twice
        _noInitializeTwice(address(account), abi.encodeWithSignature("initialize(address)", address(this)));
    }
}
