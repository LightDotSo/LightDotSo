// Copyright 2023-2024 Light
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

import {LightalletFactory} from "@/contracts/LightalletFactory.sol";
import {Lightaymaster} from "@/contracts/Lightaymaster.sol";
import {BaseLighteployer} from "@/script/base/BaseLighteployer.s.sol";
import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Base deployer test for scripts
abstract contract BaseLighteployerOps is BaseLighteployer, Script {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseLighteployerOps setup
    function setUp() public virtual override {
        // setUp from BaseLighteployer
        BaseLighteployer.setUp();

        // LightalletFactory core contract
        factory = LightalletFactory(LIGHT_FACTORY_ADDRESS);

        // Lightaymaster core contract
        paymaster = Lightaymaster(LIGHT_PAYMASTER_ADDRESS);
    }
}
