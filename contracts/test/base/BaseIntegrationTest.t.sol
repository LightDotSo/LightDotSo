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

import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {Test} from "forge-std/Test.sol";

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
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Base test setup
        BaseTest.setUp();

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
}
