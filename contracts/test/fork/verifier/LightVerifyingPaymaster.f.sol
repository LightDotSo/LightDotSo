// Copyright 2023-2024 Light, Inc.
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

import {UserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/UserOperation.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
import {BaseForkTest} from "@/test/base/BaseForkTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract LightVerifyingPaymasterForkTest is BaseForkTest {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseForkTest.setUp();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the factory can create a new account at the predicted address
    function testFork_paymaster_getHash() public {
        address sender = address(0);
        uint256 nonce = 0;
        bytes memory initCode = "";
        bytes memory callData = "";
        uint256 callGasLimit;
        uint256 verificationGasLimit = 0;
        uint256 preVerificationGas = 0;
        uint256 maxFeePerGas = 0;
        uint256 maxPriorityFeePerGas = 0;
        bytes memory paymasterAndData =
            hex"000000000018d32df916ff115a25fbefc70baf8b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
        bytes memory signature = hex"";

        UserOperation memory op = UserOperation(
            sender,
            nonce,
            initCode,
            callData,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            signature
        );
        // Get the hash w/ custom operation
        bytes32 hash = paymaster.getHash(op, 0, 0);

        // Assert the hash is correct if chain ID is 1
        if (block.chainid == 1) {
            assertEq(hash, 0xb2072a8f48b9b898d026920dc502740e4786e67eca4ab132ff4336a78f7e73f8);
        }

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }

    /// Tests that the `verifyingSigner` is set correctly
    function testFork_paymaster_verifyingSigner() public {
        assertEq(paymaster.verifyingSigner(), OFFCHAIN_VERIFIER_ADDRESS);
    }
}
