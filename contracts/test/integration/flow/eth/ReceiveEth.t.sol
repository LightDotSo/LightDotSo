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
