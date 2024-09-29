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

import {BaseLightDeployerFlow} from "@/script/base/BaseLightDeployerFlow.s.sol";
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

// ERC20Transfer -- Test ERC20 transfer
contract ERC20TransferFlowScript is BaseLightDeployerFlow {
    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------
    MockERC20 internal token;

    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // Deploy a new LightWallet
        // deployLightWallet();

        // Start the broadcast
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        // // Deploy a new MockERC20
        // token = new MockERC20("Test", "TEST", 18);

        // // Mint 1e18 ERC20s to the account
        // token.mint(address(PRIVATE_KEY_DEPLOYER), 1e18);
        // assertEq(token.balanceOf(address(PRIVATE_KEY_DEPLOYER)), 1e18);

        // // Transfer to address 0x0
        // token.transfer(address(0x462F9B138Ec29DB9Ee59f261f641633388A94aA1), 1e18);
        // assertEq(token.balanceOf(address(PRIVATE_KEY_DEPLOYER)), 0);
        // assertEq(token.balanceOf(address(0x462F9B138Ec29DB9Ee59f261f641633388A94aA1)), 1e18);

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
