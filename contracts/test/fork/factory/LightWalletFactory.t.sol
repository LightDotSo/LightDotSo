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

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
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

    /// Same as `testFork_wallet_createAccount_equalsGetAddress`
    function test_ShouldDeployANewLightWalletWithTheCorrectHash() external onlyForkProfile {
        // it should deploy a new LightWallet with the correct hash
        testFork_wallet_createAccount_equalsGetAddress();
    }

    /// Tests that the factory can create a new account at the predicted address
    function testFork_wallet_createAccount_equalsGetAddress() public {
        // Create the account using the factory w/ hash 1, nonce 0
        account = factory.createAccount(bytes32(uint256(1)), bytes32(uint256(0)));

        // Get the predicted address of the new account
        address predicted = factory.getAddress(bytes32(uint256(1)), bytes32(uint256(0)));

        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
    }
}
