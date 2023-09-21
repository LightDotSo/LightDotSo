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

import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
import {BaseLightDeployer} from "@/script/base/BaseLightDeployer.s.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {Script} from "forge-std/Script.sol";
import {Test} from "forge-std/Test.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Base deployer test for scripts
abstract contract BaseLightDeployerOps is BaseLightDeployer, BaseTest, Script {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseLightDeployerOps setup
    function setUp() public virtual override(BaseLightDeployer, BaseTest) {
        // setUp from BaseLightDeployer
        BaseLightDeployer.setUp();

        // LightWalletFactory core contract
        factory = LightWalletFactory(LIGHT_FACTORY_ADDRESS);

        // LightVerifyingPaymaster core contract
        paymaster = LightVerifyingPaymaster(LIGHT_PAYMASTER_ADDRESS);
    }
}
