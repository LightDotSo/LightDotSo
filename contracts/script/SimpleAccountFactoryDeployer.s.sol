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
import {SimpleAccountFactory} from "@/contracts/samples/SimpleAccountFactory.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";

// SimpleAccountFactoryDeployer -- Deploys the SimpleAccountFactory contract
contract SimpleAccountFactoryDeployer is BaseLightDeployer, Script {
    // -------------------------------------------------------------------------
    // Bytecode
    // -------------------------------------------------------------------------

    bytes private byteCode = type(SimpleAccountFactory).creationCode;
    bytes private initCode = abi.encodePacked(byteCode, abi.encode(address(ENTRY_POINT_ADDRESS)));

    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(keccak256(initCode));
        // The init code hash of the SimpleAccountFactory
        bytes32 initCodeHash = 0x10c61f90119f745697ea2a4a58bfc97ff48511f275419368561c3c31c66723ef;
        // Assert that the init code is the expected value
        assert(keccak256(initCode) == initCodeHash);

        // Salt for deterministic deployment
        bytes32 salt = bytes32(uint256(12));

        // Use regular broadcast
        vm.startBroadcast();

        // Create SimpleAccountFactory
        simpleAccountFactory = SimpleAccountFactory(IMMUTABLE_CREATE2_FACTORY.safeCreate2(salt, initCode));

        // Assert that the factory is the expected address
        assert(address(simpleAccountFactory) == SIMPLE_ACCOUNT_FACTORY_ADDRESS);

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
