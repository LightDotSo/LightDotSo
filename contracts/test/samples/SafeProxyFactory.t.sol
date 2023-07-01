// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import {SafeProxy} from "@safe-global/safe-contracts/contracts/proxies/SafeProxy.sol";
import {SafeProxyFactory} from "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import {Test} from "forge-std/Test.sol";

contract TestSafeProxyFactory is Test {
    SafeProxyFactory factory;

    function setUp() public {
        factory = new SafeProxyFactory();
    }

    // Test that the proxy creation code is the same as the one in SafeProxy
    function test_proxyCreationCode() public {
        assertEq(factory.proxyCreationCode(), type(SafeProxy).creationCode);
    }
}
