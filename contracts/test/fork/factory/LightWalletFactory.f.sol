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
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseForkTest} from "@/test/base/BaseForkTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract LightWalletFactoryForkTest is BaseForkTest {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseForkTest.setUp();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the factory can create a new account at the predicted address
    function testFork_createAccount_equalsGetAddress() public {
        // Create the account using the factory w/ hash 1, nonce 0
        account = factory.createAccount(bytes32(uint256(1)), bytes32(uint256(8)));

        // Get the predicted address of the new account
        address predicted = factory.getAddress(bytes32(uint256(1)), bytes32(uint256(8)));

        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
    }
}
