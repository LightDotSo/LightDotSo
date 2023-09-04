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

import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
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
        // Start the broadcast
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        // Deploy a new LightWallet
        deployLightWallet();

        // Deploy a new MockERC20
        token = new MockERC20("Test", "TEST", 18);

        // Mint 1e18 ERC20s to the account
        token.mint(address(PRIVATE_KEY_DEPLOYER), 1e18);
        assertEq(token.balanceOf(address(PRIVATE_KEY_DEPLOYER)), 1e18);

        // Transfer to address 0x0
        token.transfer(address(0x462F9B138Ec29DB9Ee59f261f641633388A94aA1), 1e18);
        assertEq(token.balanceOf(address(PRIVATE_KEY_DEPLOYER)), 0);
        assertEq(token.balanceOf(address(0x462F9B138Ec29DB9Ee59f261f641633388A94aA1)), 1e18);

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
