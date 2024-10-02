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

// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {MagicSpend} from "magic-spend/MagicSpend.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {LightPaymasterUtils} from "@/test/utils/LightPaymasterUtils.sol";

/// @notice Unit tests for `LightPaymaster` for getting base hash
contract PaymasterGetHashUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the paymaster getHash function works correctly
    function test_paymaster_getHash() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);

        LightPaymaster paymaster = new LightPaymaster(address(entryPoint));

        MagicSpend.WithdrawRequest memory request = MagicSpend.WithdrawRequest({
            asset: address(0),
            amount: 1 ether,
            nonce: 0,
            expiry: uint48(0),
            signature: new bytes(0)
        });

        // Log the paymaster address
        // solhint-disable-next-line no-console
        console.log(address(paymaster));

        // Get the hash of the withdraw request
        bytes32 paymaster_hash = paymaster.getHash(sender, request);

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(paymaster_hash);

        // Calculate the expected hash using our utility function
        bytes32 expected_hash =
            LightPaymasterUtils.getWithdrawRequestHash(address(paymaster), sender, request);

        // Assert that the hashes match
        assertEq(paymaster_hash, expected_hash, "Paymaster hash should match the expected hash");
    }
}
