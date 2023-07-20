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
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {Test} from "forge-std/Test.sol";

abstract contract BaseFactoryTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Utility Contracts
    // -------------------------------------------------------------------------

    // Testing utility contract
    ProxyUtils proxyUtils;

    // ImmutableProxy contract
    ImmutableProxy immutableProxy;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev Base factory test setup
    function setUp() public virtual override {
        // BaseIntegrationTest test setup
        BaseIntegrationTest.setUp();

        // Deploy the ProxyUtils utility contract
        proxyUtils = new ProxyUtils();

        // Deploy the immutable proxy
        immutableProxy = new ImmutableProxy();
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    /// @dev Upgrade the account to the new implementation and assert that the implementation is correct
    function _upgradeToUUPS(address _proxy, address _newImplementation) internal {
        // Upgrade the account to the new implementation
        _upgradeTo(_proxy, address(_newImplementation));
        // Assert that the account is now the new version
        assertEq(proxyUtils.getProxyImplementation(address(_proxy)), address(_newImplementation));
    }

    /// @dev Upgrade the account to the immutable version and assert that the implementation is correct
    function _upgradeToImmutable(address _proxy) internal {
        // Upgrade the account to the immutable version
        _upgradeTo(_proxy, address(immutableProxy));
        // Assert that the account is now immutable
        assertEq(proxyUtils.getProxyImplementation(address(_proxy)), address(immutableProxy));
        // Assert that the account cannot be upgraded again
        vm.expectRevert("Upgrades are disabled");
        _upgradeTo(_proxy, address(0));
    }

    /// @dev Just the plain upgradeTo function from UUPSUpgradeable
    function _upgradeTo(address _proxy, address _newImplementation) internal {
        // Upgrade the account to the new implementation
        UUPSUpgradeable(_proxy).upgradeTo(address(_newImplementation));
    }

    /// @dev Assert that the proxy admin is the zero address
    function _noProxyAdmin(address _proxy) internal {
        // Assert that the proxy admin is the zero address
        assertEq(proxyUtils.getProxyAdmin(_proxy), address(0));
    }

    /// @dev Check that the account is not initializable twice
    // Why Initialize is required: https://stackoverflow.com/questions/72475214/solidity-why-use-initialize-function-instead-of-constructor
    function _noInitializeTwice(address _proxy, bytes memory _calldata) internal {
        vm.expectRevert(bytes("Initializable: contract is already initialized"));
        // Check that the account is initializable
        (bool success,) = _proxy.call(_calldata);
        // Assert that the code was not reverted
        assertEq(success, true);
    }
}
