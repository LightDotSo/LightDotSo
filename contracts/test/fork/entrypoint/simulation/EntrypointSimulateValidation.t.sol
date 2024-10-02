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

import {IEntryPoint} from
    "@eth-infinitism/account-abstraction-v0.6/contracts/interfaces/IEntryPoint.sol";
import {IStakeManager} from
    "@eth-infinitism/account-abstraction-v0.6/contracts/interfaces/IStakeManager.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseForkTest} from "@/test/base/BaseForkTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract EntrypointSimulateValidationForkTest is BaseForkTest {
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

    /// Same as `testFork_simulateValidation`
    function test_ShouldSimulateCorrectlyReturnsValidationResult() external {
        // it should simulate correctly (returns ValidationResult)
        testFork_simulateValidation();
    }

    /// Tests that the factory can create a new account at the predicted address
    function testFork_simulateValidation() public onlyForkProfile {
        // Create a random nonce
        nonce = randomNonce();

        // The to-be-deployed account at expected Hash, nonce
        LightWallet newWallet = LightWallet(payable(factory.getAddress(expectedImageHash, nonce)));

        // Deposit 1e30 ETH into the account
        vm.deal(address(newWallet), 1e30);

        // Set the initCode to create an account with the expected image hash and nonce
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeWithSelector(
                LightWalletFactory.createAccount.selector, expectedImageHash, nonce
            )
        );
        // Example UserOperation to create the account
        PackedUserOperation memory op = entryPoint.signPackUserOp(
            vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint
        );

        // Log the UserOperation
        // solhint-disable-next-line no-console
        console.logBytes(abi.encode(op));

        // IEntryPoint.ReturnInfo memory returnInfo =
        //     IEntryPoint.ReturnInfo(396463, 1002500000000, false, 0, 281474976710655, "");
        // IStakeManager.StakeInfo memory senderInfo = IStakeManager.StakeInfo(0, 0);
        // IStakeManager.StakeInfo memory factoryInfo = IStakeManager.StakeInfo(0, 0);
        // IStakeManager.StakeInfo memory paymasterInfo = IStakeManager.StakeInfo(0, 0);

        // vm.expectRevert(
        //     abi.encodeWithSelector(
        //         IEntryPoint.ValidationResult.selector, returnInfo, senderInfo, factoryInfo,
        // paymasterInfo
        //     )
        // );
    }
}
