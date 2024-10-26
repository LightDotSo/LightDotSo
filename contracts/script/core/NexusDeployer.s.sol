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

import {Nexus} from "@/contracts/core/Nexus.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
import {Script} from "forge-std/Script.sol";

// NexusDeployer -- Deploys the Nexus contract
contract NexusDeployer is BaseLightDeployer, Script {
    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // If testing on a local chain, use without a safe create2
        if (block.chainid == 0x7a69) {
            // Use private key
            vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

            // Deploy the nexus
            nexus = deployNexus();
        } else {
            // Use regular broadcast
            vm.startBroadcast();

            // Deploy the nexus
            nexus = deployNexus();
        }

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
