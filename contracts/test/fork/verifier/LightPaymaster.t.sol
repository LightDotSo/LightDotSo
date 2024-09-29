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
import {MagicSpend} from "magic-spend/MagicSpend.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {BaseForkTest} from "@/test/base/BaseForkTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract LightPaymasterForkTest is BaseForkTest {
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

    /// Same as `testFork_paymaster_getHash`
    function test_ChecksThatThePaymasterIsProperlyDeployed() external onlyForkProfile {
        // it should deploy a new LightWallet with the correct hash
        testFork_paymaster_getHash();
    }

    /// Tests that the factory can create a new account at the predicted address
    function testFork_paymaster_getHash() public {
        address sender = address(0);
        uint256 nonce = 0;
        bytes memory initCode = "";
        bytes memory callData = "";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 0;
        bytes32 gasFees = bytes32(0);
        bytes memory paymasterAndData =
            hex"000000000018d32df916ff115a25fbefc70baf8b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
        bytes memory signature = hex"";

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

        MagicSpend.WithdrawRequest memory request = MagicSpend.WithdrawRequest(bytes(""), address(0), 0, 0, uint48(0));
        // Get the hash w/ custom operation
        bytes32 hash = paymaster.getHash(address(account), request);

        // Assert the hash is correct if chain ID is 1
        if (block.chainid == 1) {
            assertEq(hash, 0xb2072a8f48b9b898d026920dc502740e4786e67eca4ab132ff4336a78f7e73f8);
        }

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }
}
