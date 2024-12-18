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

import {LIGHT_WALLET_FACTORY_ADDRESS, LIGHT_PAYMASTER_ADDRESS} from "@/constant/address.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Base deployer test for scripts
abstract contract BaseLightDeployerOps is BaseLightDeployer, Script {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseLightDeployerOps setup
    function setUp() public virtual override {
        // setUp from BaseLightDeployer
        BaseLightDeployer.setUp();

        // LightWalletFactory core contract
        factory = LightWalletFactory(LIGHT_WALLET_FACTORY_ADDRESS);

        // LightPaymaster core contract
        paymaster = LightPaymaster(LIGHT_PAYMASTER_ADDRESS);
    }
}
