// Copyright 2023-2024 Light, Inc.
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

pragma solidity ^0.8.18;

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";

// LightWalletFactoryDeployer -- Deploys the LightWalletFactory contract
contract LightWalletFactoryDeployer is BaseLightDeployer, Script {
    // -------------------------------------------------------------------------
    // Bytecode
    // -------------------------------------------------------------------------

    bytes private byteCode = type(LightWalletFactory).creationCode;
    bytes private initCode = abi.encodePacked(byteCode, abi.encode(address(ENTRY_POINT_ADDRESS)));

    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(keccak256(initCode));
        // The init code hash of the LightWalletFactory
        bytes32 initCodeHash = 0x8957ba1f77a4becdcfe5a5e01d4516901271037e93597fe921161829034d540e;
        // Assert that the init code is the expected value
        assert(keccak256(initCode) == initCodeHash);

        // Salt for deterministic deployment
        bytes32 salt = 0x0000000000000000000000000000000000000000a2850b49daa90b2a103159bd;

        // If testing on a local chain, use without a safe create2
        if (block.chainid == 0x7a69) {
            // Use private key
            vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

            // Construct the entrypoint
            entryPoint = new EntryPoint();

            // Create the factory
            factory = new LightWalletFactory(entryPoint);
        } else {
            // Use regular broadcast
            vm.startBroadcast();

            // Create LightWalletFactory
            factory = LightWalletFactory(IMMUTABLE_CREATE2_FACTORY.safeCreate2(salt, initCode));

            // Assert that the factory is the expected address
            assert(address(factory) == LIGHT_FACTORY_ADDRESS);
        }

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
