// Copyright 2023-2024 Light.
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
