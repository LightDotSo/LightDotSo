// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@/core/EntryPoint.sol";
import "@/proxies/SimpleAccount.sol";
import "@/proxies/SimpleAccountFactory.sol";
import "forge-std/Test.sol";

contract TestSimpleAccountFactory is Test {
    EntryPoint entryPoint;
    SimpleAccount account;
    SimpleAccountFactory factory;

    function setUp() public {
        entryPoint = new EntryPoint();
        account = new SimpleAccount(entryPoint);
        factory = new SimpleAccountFactory(entryPoint);
    }

    function test_predictedCreateAccount() public {
        address predicted = factory.getAddress(address(this), 0);
        SimpleAccount createdAccount = factory.createAccount(address(this), 0);
        assertEq(predicted, address(createdAccount));
    }
}
