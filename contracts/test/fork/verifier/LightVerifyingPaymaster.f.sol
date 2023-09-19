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
        address sender = address(0x0476DF9D2faa5C019d51E6684eFC37cB4f7b8b14);
        uint256 nonce = 0;
        bytes memory initCode = "";
        bytes memory callData = "";
        uint256 callGasLimit;
        uint256 verificationGasLimit = 150000;
        uint256 preVerificationGas = 21000;
        uint256 maxFeePerGas = 1091878423;
        uint256 maxPriorityFeePerGas = 1000000000;
        bytes memory paymasterAndData = "";
        bytes memory signature =
            hex"983f1a8c786be7a3661666abe8af0e687cd429ffc304c2593b52c4fd052b9f2734eddf9a64f718106fe7ad8975ea5291d5018a9adfb4172fef2321c948ba80c51c";

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
        bytes32 hash = paymaster.getHash(op, 0x00000000deadbeef, 0x0000000000001234);

        // Assert the hash is correct if chain ID is 1
        if (block.chainid == 1) {
            assertEq(hash, 0x8de0df60b31116ee8d79fffef79ff348469c560a17b8a1e9ae7b40181369db63);
        }

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }
}
