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
import {MockERC1155} from "solmate/test/utils/mocks/MockERC1155.sol";
import {Test} from "forge-std/test.sol";

/// @notice Unit tests for `LightWallet` for compatibility w/ ERC-721
contract ERC1155UnitTest is BaseTest, Test {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // ERC1155 token to send
    MockERC1155 internal multi;

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account complies w/ ERC-165
    function test_erc1155_onReceived() public {
        // Create the account using the factory w/ hash 1, nonce 0
        _testCreateAccountWithNonceZero();

        // Deploy a new MockERC1155
        multi = new MockERC1155();

        // Make an address from
        address from = makeAddr("from");

        // Mint 10 tokens of id of 1 to this EOA
        multi.mint(address(from), 1, 10, "");

        // Check that the account supports ERC-721
        vm.prank(from);
        multi.safeTransferFrom(address(from), address(account), 1, 1, "");
    }
}
