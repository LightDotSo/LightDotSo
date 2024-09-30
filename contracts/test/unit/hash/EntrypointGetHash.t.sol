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
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `EntryPoint` for getting base hash
contract EntrypointGetHashUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the entrypoint getHash function works correctly
    function test_entrypoint_getHashZeroed() public {
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

        address sender = address(0x1306b01bC3e4AD202612D3843387e94737673F53);
        uint256 nonce = 8942;
        bytes memory initCode =
            hex"69420694206942069420694206942069420694200000000000000000000000000000000000000000080085";
        bytes memory callData = hex"0000000000000000000000000000000000000000080085";
        bytes32 accountGasLimits = ERC4337Utils.packAccountGasLimits(10000, 100000);
        uint256 preVerificationGas = 100;
        bytes32 gasFees = ERC4337Utils.packGasFees(99999, 9999999);
        bytes memory paymasterAndData = ERC4337Utils.packPaymasterAndData(
            address(0x000000000018d32DF916ff115A25fbeFC70bAf8b),
            100000,
            100000,
            hex"0000000000000000000000000000000000000000080085"
        );
        bytes memory signature = hex"da0929f527cded8d0a1eaf2e8861d7f7e2d8160b7b13942f99dd367df4473a";

        // Log the paymaster and data
        // solhint-disable-next-line no-console
        console.logBytes(paymasterAndData);

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

        // Encode the user operation
        // bytes memory encodedOp = UserOperationLib2.encode(op);

        // Log the packed hash
        // solhint-disable-next-line no-console
        // console.logBytes(encodedOp);

        bytes32 hash = entryPoint.getUserOpHash(op);

        // Log the hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);

        assertEq(hash, bytes32(0x01fbca3fb8147c7e348bc8273b59ed6e04501e265648fe104f206f80e3b848f9));
    }
}
