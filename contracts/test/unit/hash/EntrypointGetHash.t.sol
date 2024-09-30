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

import {PackedUserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {ENTRYPOINT_V070_ADDRESS} from "@/constants/address.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Unit tests for `EntryPoint` for getting base hash
contract EntrypointGetHashUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the entrypoint getHash function works correctly
    function test_entrypoint_getHash() public {
        EntryPoint entryPoint = deployEntryPoint();

        // Log the address of the entrypoint
        // solhint-disable-next-line no-console
        console.log(address(entryPoint));

        // Assert that the chainid is 31337 (anvil)
        assert(block.chainid == 31337);

        // Assert that the entrypoint is the entrypoint at 0x0000000071727De22E5E9d8BAf0edAc6f37da032
        assertEq(address(entryPoint), address(ENTRYPOINT_V070_ADDRESS));

        address sender = address(0);
        uint256 nonce = 0;
        bytes memory initCode = "";
        bytes memory callData = "";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 0;
        bytes32 gasFees = bytes32(0);
        bytes memory paymasterAndData = "";
        bytes memory signature = "";

        PackedUserOperation memory op = PackedUserOperation(
            sender,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            signature
        );

        bytes32 hash = entryPoint.getUserOpHash(op);

        // Log the hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);

        assertEq(hash, bytes32(0x5f747cb1c81ad5704267c33fcd46224a19068012df5ed00e0d5be49e7ec972ec));
    }
}
