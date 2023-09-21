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
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";

/// @notice Base fork fuzz test for `LightWallet`
abstract contract BaseForkTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    // Prank sender address - kaki.eth
    address internal constant PRANK_SENDER_ADDRESS = address(0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed);

    // EntryPoint address
    address payable internal constant ENTRY_POINT_ADDRESS = payable(address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));

    // LightWalletFactory address
    address internal constant LIGHT_FACTORY_ADDRESS = address(0x0000000000756D3E6464f5efe7e413a0Af1C7474);

    // LightVerifyingPaymaster address
    address internal constant LIGHT_PAYMASTER_ADDRESS = address(0x000000000018d32DF916ff115A25fbeFC70bAf8b);

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseForkTest setup
    function setUp() public virtual override {
        // Base integration test setup
        BaseIntegrationTest.setUp();

        // EntryPoint from eth-inifinitism
        entryPoint = EntryPoint(ENTRY_POINT_ADDRESS);
        // LightWalletFactory core contract
        factory = LightWalletFactory(LIGHT_FACTORY_ADDRESS);
        // LightVerifyingPaymaster core contract
        paymaster = LightVerifyingPaymaster(LIGHT_PAYMASTER_ADDRESS);

        // Get network name
        string memory defaultName = "mainnet";
        string memory name = vm.envOr("NETWORK_NAME", defaultName);

        // Fork network setup
        vm.createSelectFork(name);

        // Prank sender setup
        vm.startPrank(PRANK_SENDER_ADDRESS);
    }
}
