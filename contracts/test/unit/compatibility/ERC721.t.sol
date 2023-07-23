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
import {MockERC721} from "solmate/test/utils/mocks/MockERC721.sol";

/// @notice Unit tests for `LightWallet` for compatibility w/ ERC-721
contract ERC721UnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // ERC721 token to send
    MockERC721 internal nft;

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account complies w/ ERC-165
    function test_erc721_onReceived() public {
        // Create the account using the factory w/ hash 1, nonce 0
        _testCreateAccountWithNonceZero();

        // Deploy a new MockERC721
        nft = new MockERC721("Test", "TEST");

        // Mint 1 ERC721 to the account
        nft.mint(address(this), 1);

        // Check that the account supports ERC-721
        nft.safeTransferFrom(address(this), address(account), 1);
    }
}
