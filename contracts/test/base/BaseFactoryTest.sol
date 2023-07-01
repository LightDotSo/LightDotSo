// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {ImmutableProxy} from "@/contracts/proxies/ImmutableProxy.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

contract BaseFactoryTest is Test {
    // Testing utility contract
    ProxyUtils proxyUtils;

    function _upgradeToUUPS(address _proxy, address _newImplementation) internal {
        // ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Upgrade the account to the new implementation
        UUPSUpgradeable(_proxy).upgradeTo(address(_newImplementation));
        // Assert that the account is now the new version
        assertEq(proxyUtils.getProxyImplementation(address(_proxy)), address(_newImplementation));
    }

    function _upgradeToImmutable(address _proxy) internal {
        // ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Deploy the immutable proxy
        ImmutableProxy immutableProxy = new ImmutableProxy();
        // Upgrade the account to the immutable version
        UUPSUpgradeable(_proxy).upgradeTo(address(immutableProxy));
        // Assert that the account is now immutable
        assertEq(proxyUtils.getProxyImplementation(address(_proxy)), address(immutableProxy));
        // Assert that the account cannot be upgraded again
        vm.expectRevert("Upgrades are disabled");
        UUPSUpgradeable(_proxy).upgradeTo(address(0));
    }

    function _noProxyAdmin(address _proxy) internal {
        // ProxyUtils utility contract
        proxyUtils = new ProxyUtils();
        // Assert that the proxy admin is the zero address
        assertEq(proxyUtils.getProxyAdmin(_proxy), address(0));
    }
}
