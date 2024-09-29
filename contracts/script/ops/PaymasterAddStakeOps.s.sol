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

import {BaseLightDeployerOps} from "@/script/base/BaseLightDeployerOps.s.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

// PaymasterAddStake -- Test Deployment
contract PaymasterAddStakeOpsScript is BaseLightDeployerOps {
    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // Start the broadcast
        vm.startBroadcast();

        // solhint-disable-next-line no-console
        console.log(paymaster.owner());

        // Add stake
        paymaster.entryPointAddStake{value: 1 ether}(1_000_000_000, 86_400);

        // Stop the broadcast
        vm.stopBroadcast();
    }
}
