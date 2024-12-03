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

import {NEXUS_V010_IMPLEMENTATION_ADDRESS} from "@/constant/address.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Unit tests for `Nexus`
contract NexusAddressTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the nexus is deployed correctly
    function test_deploy_nexus() public {
        // Create the nexus
        nexus = deployNexus();

        // Test that the address is correct
        assertEq(address(nexus), address(NEXUS_V010_IMPLEMENTATION_ADDRESS));

        // Get the version
        string memory version = nexus.accountId();

        // Log the version
        // solhint-disable-next-line no-console
        console.log("Nexus version: %s", version);
    }
}
