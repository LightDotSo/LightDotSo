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

/// @notice Unit tests for `LightWallet` for compatibility w/ ERC-165
contract CompatibilityUnitTest is BaseTest {
    /// Tests that the account complies w/ ERC-165
    function test_erc_165() public {
        // ERC165 interface id
        bytes4 interfaceId165 = 0x01ffc9a7;
        // ERC721 interface id
        bytes4 interfaceId721 = 0x150b7a02;
        // ERC1155 interface id
        bytes4 interfaceId1155 = 0x4e2312e0;

        // Test that the account supports interfaces
        assertEq(account.supportsInterface(interfaceId165), true);
        assertEq(account.supportsInterface(interfaceId721), true);
        assertEq(account.supportsInterface(interfaceId1155), true);
    }
}
