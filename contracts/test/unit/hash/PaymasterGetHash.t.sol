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

import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {UserOperation} from "@/contracts/LightWallet.sol";
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Unit tests for `LightVerifyingPaymaster` for getting base hash
contract PaymasterGetHash is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account complies w/ ERC-165
    function test_getHash() public {
        address sender = address(0x1);
        uint256 nonce = 0;
        bytes memory initCode = new bytes(0);
        bytes memory callData = new bytes(1);
        uint256 callGasLimit = 0;
        uint256 verificationGasLimit = 0;
        uint256 preVerificationGas = 0;
        uint256 maxFeePerGas = 0;
        uint256 maxPriorityFeePerGas = 0;
        bytes memory paymasterAndData = new bytes(2);
        bytes memory signature = new bytes(3);

        UserOperation memory userOperation = UserOperation(
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

        LightVerifyingPaymaster paymaster = new LightVerifyingPaymaster(IEntryPoint(address(0)), address(1));

        bytes32 hash = paymaster.getHash(userOperation, uint48(1), uint48(2));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }
}
