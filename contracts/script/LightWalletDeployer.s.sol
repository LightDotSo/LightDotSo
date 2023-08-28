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

import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightDeployer} from "@/script/LightDeployer.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";

// LightWalletDeployer -- Deploys the LightWallet contract
contract LightWalletDeployer is LightDeployer, Script {
    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------
    LightWallet private wallet;
    LightWalletFactory private factory;

    function run() public {
        // Start the broadcast
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        // If testing on a local chain, use the existing address
        if (block.chainid == 0x7a69) {
            // Get the factory
            factory = LightWalletFactory(address(0x262aD6Becda7CE4B047a3130491978A8f35F9aeC));

            // Create an account
            wallet = factory.createAccount(bytes32(uint256(1)), randMod());

            // solhint-disable-next-line no-console
            console.log("LightWallet deployed at address: %s", address(wallet));
        } else {
            // Get the factory
            factory = LightWalletFactory(address(LIGHT_FACTORY_ADDRESS));

            // Create an account
            wallet = factory.createAccount(bytes32(uint256(1)), uint256(1));
        }

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
