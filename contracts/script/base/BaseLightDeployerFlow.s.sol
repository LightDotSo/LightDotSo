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
import {LightWalletUtils} from "@/test/utils/LightWalletUtils.sol";
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
        // Set the random nonce
        bytes32 nonce = randMod();

        // Specify the entryPoint
        entryPoint = EntryPoint(payable(address(ENTRY_POINT_ADDRESS)));

        // Specify the factory
        factory = LightWalletFactory(LIGHT_FACTORY_ADDRESS);

        // Get the expected image hash
        expectedImageHash = getExpectedImageHash(PRIVATE_KEY_DEPLOYER);

        // Get the expected address
        address expectedAddress = factory.getAddress(expectedImageHash, nonce);

        // Deposit ETH into the account for stake deposit
        // address(expectedAddress).call{value: 1002500000000}("");

        // Set the initCode to create an account with the expected image hash and random nonce
        bytes memory initCode = abi.encodePacked(
            LIGHT_FACTORY_ADDRESS,
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce)
        );

        // solhint-disable-next-line no-console
        console.logBytes(initCode);

        getEthEstimateUserOperationGas(expectedAddress, initCode);
        // UserOperation to create the account
        // UserOperation[] memory ops = entryPoint.signPackUserOp(
        //     lightWalletUtils, address(expectedAddress), "", vm.envUint("PRIVATE_KEY"), initCode
        // );

        // Handle the ops
        // entryPoint.handleOps(ops, payable(address(1)));

        // solhint-disable-next-line no-console
        console.log("LightWallet to be deployed at address: %s", address(expectedAddress));
        // assert(address(expectedAddress).code.length > 0);

        return wallet;
    }
}
