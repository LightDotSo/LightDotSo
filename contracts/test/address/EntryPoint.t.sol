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

import {ENTRYPOINT_V070_ADDRESS} from "@/constant/address.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";

/// @notice Unit tests for `EntryPoint`
contract EntryPointAddressTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the entry point is deployed correctly
    function test_deploy_entryPoint() public {
        // Create the entry point
        entryPoint = deployEntryPoint();

        // Test that the address is correct
        assertEq(address(entryPoint), address(ENTRYPOINT_V070_ADDRESS));
    }
}
