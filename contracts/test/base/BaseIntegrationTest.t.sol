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
import {Test} from "forge-std/Test.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {ImmutableProxy} from "@/contracts/proxies/ImmutableProxy.sol";

/// @notice Base integration test for `LightWallet`
abstract contract BaseIntegrationTest is BaseTest {
    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------

    // Address of the owner of the account
    address internal user;
    // Private key of the owner of the account
    uint256 internal userKey;
    // Address of the beneficiary of the account
    address payable internal beneficiary;
    // Hash of the expected image
    bytes32 internal expectedImageHash;

    // -------------------------------------------------------------------------
    // Utility Contracts
    // -------------------------------------------------------------------------

    // ImmutableProxy contract
    ImmutableProxy immutableProxy;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev Base integration test setup
    function setUp() public virtual override {
        // Base test setup
        BaseTest.setUp();

        // Deploy the immutable proxy
        immutableProxy = new ImmutableProxy();

        // Set the user and userKey
        (user, userKey) = makeAddrAndKey("user");
        // Set the beneficiary
        beneficiary = payable(address(makeAddr("beneficiary")));
        // Get the expected image hash
        expectedImageHash = lightWalletUtils.getExpectedImageHash(user);
        // Create the account using the factory w/ nonce 0 and hash
        account = factory.createAccount(expectedImageHash, 0);

        // Deposit 1e30 ETH into the account
        vm.deal(address(account), 1e30);
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
