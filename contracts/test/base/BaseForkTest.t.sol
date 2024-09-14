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

import {
    ENTRY_POINT_ADDRESS,
    LIGHT_FACTORY_ADDRESS,
    LIGHT_TIMELOCK_CONTROLLER_FACTORY_ADDRESS,
    LIGHT_PAYMASTER_ADDRESS
} from "@/constants/addresses.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
import {LightTimelockControllerFactory} from "@/contracts/LightTimelockControllerFactory.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";

/// @notice Base fork fuzz test for `LightWallet`
abstract contract BaseForkTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    // Prank sender address - kaki.eth
    address internal constant PRANK_SENDER_ADDRESS = address(0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed);

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
        // LightTimelockControllerFactory core contract
        timelockFactory = LightTimelockControllerFactory(LIGHT_TIMELOCK_CONTROLLER_FACTORY_ADDRESS);
        // LightPaymaster core contract
        paymaster = LightPaymaster(payable(LIGHT_PAYMASTER_ADDRESS));

        // Get network name
        string memory defaultName = "mainnet";
        string memory name = vm.envOr("NETWORK_NAME", defaultName);

        // Fork network setup
        vm.createSelectFork(name);

        // Prank sender setup
        vm.startPrank(PRANK_SENDER_ADDRESS);
    }
}
