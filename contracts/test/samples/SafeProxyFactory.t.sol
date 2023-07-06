// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import {SafeProxy} from "@/contracts/samples/SafeProxy.sol";
import {SafeProxyFactory} from "@/contracts/samples/SafeProxyFactory.sol";
import {Test} from "forge-std/Test.sol";

contract SafeProxyFactoryTest is Test {
    SafeProxyFactory private factory;

    function setUp() public {
        factory = new SafeProxyFactory();
    }

    // Test that the proxy creation code is the same as the one in SafeProxy
    function test_safe_proxyCreationCode() public {
        assertEq(factory.proxyCreationCode(), type(SafeProxy).creationCode);
    }
}
