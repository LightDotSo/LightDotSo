// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {MockERC1155} from "solmate/test/utils/mocks/MockERC1155.sol";

/// @notice Unit tests for `LightWallet` for compatibility w/ ERC-721
contract ERC1155UnitTest is BaseTest {
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
