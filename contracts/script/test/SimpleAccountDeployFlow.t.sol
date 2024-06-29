// Copyright 2023-2024 Light.
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

import {BaseLightDeployerFlow} from "@/script/base/BaseLightDeployerFlow.s.sol";
import {SimpleAccountDeployFlowScript} from "@/script/flow/SimpleAccountDeployFlow.s.sol";

// SimpleAccountDeploy -- Test Deployment
contract SimpleAccountDeployFlowScriptTest is BaseLightDeployerFlow {
    SimpleAccountDeployFlowScript script;

    function setUp() public override {
        super.setUp();

        script = new SimpleAccountDeployFlowScript();
    }

    function test_run() public {
        // FIXME: Once the pm is ready, we should use the pm to deploy the contract
        // script.run();
    }
}
