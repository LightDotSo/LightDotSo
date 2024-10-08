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

import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {IEntryPointSimulations} from
    "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPointSimulations.sol";
import {IStakeManager} from
    "@eth-infinitism/account-abstraction/contracts/interfaces/IStakeManager.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {EntryPointSimulations} from "@/contracts/core/EntryPointSimulations.sol";
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
            abi.encodeWithSelector(
                LightWalletFactory.createAccount.selector, expectedImageHash, nonce
            )
        );
        // Example UserOperation to create the account
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint
        );
        PackedUserOperation memory op = ops[0];

        IEntryPoint.ReturnInfo memory returnInfo =
            IEntryPoint.ReturnInfo(405_989, 1_002_500_000_000, 0, 281_474_976_710_655, "");
        IStakeManager.StakeInfo memory senderInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory factoryInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory paymasterInfo = IStakeManager.StakeInfo(0, 0);
        IEntryPoint.AggregatorStakeInfo memory aggregatorInfo =
            IEntryPoint.AggregatorStakeInfo(address(0), IStakeManager.StakeInfo(0, 0));
        IEntryPointSimulations.ValidationResult memory validationResult = IEntryPointSimulations
            .ValidationResult(returnInfo, senderInfo, factoryInfo, paymasterInfo, aggregatorInfo);

        // solhint-disable-next-line no-console
        console.logBytes(abi.encode(validationResult.returnInfo));

        vm.prank(address(entryPoint));
        vm.expectRevert();
        // it should revert on a {ValidationResult} error
        entryPointSimulations.simulateValidation(op);
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
            abi.encodeWithSelector(
                LightWalletFactory.createAccount.selector, expectedImageHash, nonce
            )
        );

        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint
        );
        PackedUserOperation memory op = ops[0];
        op.signature = "";

        // Revert for conventional upgrades w invalid signature
        vm.expectRevert(
            abi.encodeWithSelector(
                IEntryPoint.FailedOpWithRevert.selector,
                uint256(0),
                "AA23 reverted",
                hex"08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001c6163636f756e743a206e6f742066726f6d20456e747279506f696e7400000000"
            )
        );
        // it should revert on a {AA23 reverted} error
        // it should not be able to initialize twice
        entryPointSimulations.simulateValidation(op);
    }
}
