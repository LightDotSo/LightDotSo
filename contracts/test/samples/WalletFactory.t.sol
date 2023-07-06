// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import {Wallet} from "@/contracts/samples/Wallet.sol";
import {Factory} from "@/contracts/samples/WalletFactory.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract WalletFactoryTest is BaseFactoryTest {
    Factory private factory;

    function setUp() public {
        factory = new Factory();
        proxyUtils = new ProxyUtils();
    }

    // Test that the proxy creation code is the same as the one in SafeProxy
    function test_wallet_deploy() public {
        factory.deploy(address(0), 0);
    }
}
