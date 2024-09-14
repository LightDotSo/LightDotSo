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

import {Create2} from "@openzeppelin/contracts-v4.9/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts-v4.9/proxy/ERC1967/ERC1967Proxy.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Unit tests for `LightWalletFactory` for getting base hash
contract LightWalletFactoryGetHashUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests raw `Create2.safeCreate2`
    function test_factory_create2() public view {
        // solhint-disable-next-line no-console
        console.logAddress(address(this));

        address computedAddress = Create2.computeAddress(bytes32(0), bytes32(0));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logAddress(computedAddress);
    }

    /// Tests that the factory complies w/ ERC-165
    function test_factory_getHash() public view {
        address computedAddress = factory.getAddress(bytes32(0), bytes32(0));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logAddress(computedAddress);
    }

    /// Tests the factory's initialize method
    function test_factory_initialize() public view {
        // solhint-disable-next-line no-console
        console.logAddress(address(wallet));

        // solhint-disable-next-line no-console
        console.logBytes(abi.encodeCall(LightWallet.initialize, (bytes32(0))));

        // solhint-disable-next-line no-console
        console.logBytes(abi.encode(address(wallet), abi.encodeCall(LightWallet.initialize, (bytes32(0)))));

        // solhint-disable-next-line no-console
        console.logBytes(
            abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(address(wallet), abi.encodeCall(LightWallet.initialize, (bytes32(0))))
            )
        );

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(address(wallet), abi.encodeCall(LightWallet.initialize, (bytes32(0))))
                )
            )
        );
    }
}
