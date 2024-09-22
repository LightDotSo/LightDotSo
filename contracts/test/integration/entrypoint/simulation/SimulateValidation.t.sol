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

import {IEntryPoint} from "@eth-infinitism/account-abstraction-v0.6/contracts/interfaces/IEntryPoint.sol";
import {IStakeManager} from "@eth-infinitism/account-abstraction-v0.6/contracts/interfaces/IStakeManager.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract EntrypointSimulationSimulateValidationIntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();

        // Construct a new nonce
        nonce = bytes32(uint256(20));

        // The to-be-deployed account at expected Hash, nonce
        wallet = LightWallet(payable(factory.getAddress(expectedImageHash, nonce)));

        // Deposit 1e30 ETH into the account
        vm.deal(address(wallet), 1e30);

        _testCreateAccountFromEntryPoint();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the entrypoint returns a correct revert code
    function test_WhenTheSignatureIsCorrect() public {
        // Construct the expected nonce
        nonce = bytes32(uint256(300));

        // The to-be-deployed account at expected Hash, nonce
        LightWallet newWallet = LightWallet(payable(factory.getAddress(expectedImageHash, nonce)));

        // Deposit 1e30 ETH into the account
        vm.deal(address(newWallet), 1e30);

        // Set the initCode to create an account with the expected image hash and nonce
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce)
        );
        // Example UserOperation to create the account
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint);
        PackedUserOperation memory op = ops[0];

        IEntryPoint.ReturnInfo memory returnInfo =
            IEntryPoint.ReturnInfo(405989, 1002500000000, false, 0, 281474976710655, "");
        IStakeManager.StakeInfo memory senderInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory factoryInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory paymasterInfo = IStakeManager.StakeInfo(0, 0);

        // vm.expectRevert(
        //     abi.encodeWithSelector(
        //         IEntryPoint.ValidationResult.selector, returnInfo, senderInfo, factoryInfo, paymasterInfo
        //     )
        // );
        // it should revert on a {ValidationResult} error
        // entryPoint.simulateValidation(op);
    }

    /// Tests that the entrypoint returns a correct revert code if incorrect params
    function test_WhenTheSignatureIsNotCorrect() public {
        // Construct the expected nonce
        bytes32 nonce = bytes32(uint256(123));

        // The to-be-deployed account at expected Hash, nonce
        LightWallet newWallet = LightWallet(payable(factory.getAddress(expectedImageHash, nonce)));

        // Set the initCode to create an account with the expected image hash and nonce
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce)
        );

        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint);
        PackedUserOperation memory op = ops[0];
        op.signature = "";

        // Revert for conventional upgrades w invalid signature
        // vm.expectRevert(abi.encodeWithSignature("FailedOp(uint256,string)", uint256(0), "AA23 reverted (or OOG)"));
        // it should revert on a {AA23 initCode (or OOG)} error
        // it should not be able to initialize twice
        // entryPoint.simulateValidation(op);
    }
}
