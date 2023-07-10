// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.18;

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

    // Why Initialize is required: https://stackoverflow.com/questions/72475214/solidity-why-use-initialize-function-instead-of-constructor
    function _noInitializeTwice(address _proxy, bytes memory _calldata) internal {
        vm.expectRevert(bytes("Initializable: contract is already initialized"));
        // Check that the account is initializable
        (bool success,) = _proxy.call(_calldata);
        // Assert that the code was not reverted
        assertEq(success, true);
    }
}
