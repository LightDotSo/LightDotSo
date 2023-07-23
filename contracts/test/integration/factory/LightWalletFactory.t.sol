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

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract LightWalletFactoryIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the factory revert when creating an account with a nonce that is 0
    function test_revertWhenBytesZero_createAccount() public {
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("ImageHashIsZero()"));
        // Get the predicted address of the new account
        account = factory.createAccount(bytes32(0), 0);
    }

    /// Tests that the factory revert when creating an account with a nonce that is 0
    function test_createAccount_alreadyExists() public {
        // Create the account using the factory w/ hash 1, nonce 0
        _testCreateAccountWithNonceZero();
        // Get the already predicted address of the new account
        address accountV2 = address(factory.createAccount(bytes32(uint256(1)), 0));
        // Assert that the predicted address matches the created account
        assertEq(accountV2, address(account));
    }

    /// Tests that the factory can create a new account at the predicted address
    function test_createAccount_emitEvents() public {
        bytes32 hash = bytes32(uint256(3));

        vm.expectEmit(true, true, true, true);
        emit ImageHashUpdated(hash);
        vm.expectEmit(true, true, true, true);
        emit Initialized(1);
        // vm.expectEmit(true, true, true, true);
        // emit LightWalletInitialized(address(entryPoint), hash);
        factory.createAccount(hash, 0);
    }

    /// Tests that the factory can create a new account at the predicted address
    function test_createAccount_equalsGetAddress() public {
        // Create the account using the factory w/ hash 1, nonce 0
        _testCreateAccountWithNonceZero();

        // Get the predicted address of the new account
        address predicted = factory.getAddress(bytes32(uint256(1)), 0);

        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
        // Get the immutable implementation in the factory
        LightWallet implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the LightWallet
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(implementation));
    }

    /// Tests that there is no proxy admin for the account
    function test_createAccount_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }

    /// Tests that the account is not initializable twice
    function test_createAccount_noInitializeTwice() public {
        // Check that the account is not initializable twice
        _noInitializeTwice(address(account), abi.encodeWithSignature("initialize(bytes32)", bytes32(uint256(0))));
    }
}
