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

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Integration tests for `LightWallet` receive ETH
contract ReceiveEthIntegrationTest is BaseIntegrationTest {
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

    /// Tests that the account can correctly transfer ETH using `send`
    function test_revertWhenReceiveEth_send() public {
        bool sent = payable(address(account)).send(1_000_000_000);
        vm.expectRevert("Failed to send Ether");
        require(sent, "Failed to send Ether");
    }

    /// Tests that the account can correctly transfer ETH using `transfer`
    function test_revertWhenReceiveEth_transfer() public {
        vm.expectRevert();
        payable(address(account)).transfer(1_000_000_000);
    }

    /// Tests that the account can correctly transfer ETH using `call`
    function test_receiveEth_call() public {
        (bool sent,) = payable(address(account)).call{value: 1 ether}("");
        require(sent, "Failed to send Ether");
    }
}
