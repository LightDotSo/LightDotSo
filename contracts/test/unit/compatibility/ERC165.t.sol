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

pragma solidity ^0.8.27;

import {BaseTest} from "@/test/base/BaseTest.t.sol";

/// @notice Unit tests for `LightWallet` for compatibility w/ ERC-165
contract ERC165UnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account complies w/ ERC-165
    function test_erc165() public {
        // Create the account using the factory w/ hash 1, nonce 0
        _testCreateAccountWithNonceZero();

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
