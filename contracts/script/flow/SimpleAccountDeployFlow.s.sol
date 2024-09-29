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

import {BaseLightDeployerFlow} from "@/script/base/BaseLightDeployerFlow.s.sol";
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

// SimpleAccountDeploy -- Test Deployment
contract SimpleAccountDeployFlowScript is BaseLightDeployerFlow {
    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------
    MockERC20 internal token;

    // -------------------------------------------------------------------------
    // Run
    // -------------------------------------------------------------------------

    function run() public {
        // Deploy a new SimpleAccount
        deploySimpleAccount();

        // Start the broadcast
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        // Stop the broadcast
        vm.stopBroadcast();
    }
}
