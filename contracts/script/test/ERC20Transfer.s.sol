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
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";

// ERC20Transfer -- Test ERC20 transfer
contract ERC20Transfer is Script, Test {
    address private deployer = address(0x81a2500fa1ae8eB96a63D7E8b6b26e6cabD2C9c0);
    MockERC20 internal token;

    function run() public {
        // Start the broadcast
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        // Only run on the local anvil
        if (block.chainid == 0x7a69) {
            // Deploy a new MockERC20
            token = new MockERC20("Test", "TEST", 18);

            // Mint 1e18 ERC20s to the account
            token.mint(address(deployer), 1e18);
            assertEq(token.balanceOf(address(deployer)), 1e18);

            // Transfer to address 0x0
            token.transfer(address(0), 1e18);
            assertEq(token.balanceOf(address(deployer)), 0);
            assertEq(token.balanceOf(address(0)), 1e18);
        }

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
