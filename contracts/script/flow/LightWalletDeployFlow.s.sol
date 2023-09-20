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

// LightWalletDeploy -- Test Deployment
contract LightWalletDeployFlowScript is BaseLightDeployerFlow {
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

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
