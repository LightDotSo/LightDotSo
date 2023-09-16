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
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {UserOperation} from "@/contracts/LightWallet.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

using ERC4337Utils for EntryPoint;

/// @notice Base deployer test for scripts
abstract contract BaseLightDeployerFlow is BaseLightDeployer, Script, Test {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseLightDeployerFlow setup
    function setUp() public virtual override {
        // setUp from BaseLightDeployer
        BaseLightDeployer.setUp();

        // LightWalletFactory core contract
        factory = LightWalletFactory(LIGHT_FACTORY_ADDRESS);

        // Get network name
        string memory defaultName = "mainnet";
        string memory name = vm.envOr("NETWORK_NAME", defaultName);

        // Fork network setup
        vm.createSelectFork(name);
    }

    function deployLightWallet() internal returns (LightWallet) {
        // Get the expected image hash
        expectedImageHash = lightWalletUtils.getExpectedImageHash(PRIVATE_KEY_DEPLOYER);

        // Set the initCode to create an account with the expected image hash and random nonce
        bytes memory initCode = abi.encodePacked(
            LIGHT_FACTORY_ADDRESS,
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, randMod())
        );

        // UserOperation to create the account
        UserOperation[] memory ops =
            entryPoint.signPackUserOp(lightWalletUtils, address(wallet), "", vm.envUint("PRIVATE_KEY"), initCode);

        entryPoint.handleOps(ops, payable(address(1)));

        // solhint-disable-next-line no-console
        console.log("LightWallet deployed at address: %s", address(wallet));

        return wallet;
    }
}
