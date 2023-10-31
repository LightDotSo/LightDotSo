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
