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
import {IStakeManager} from "@eth-infinitism/account-abstraction/contracts/interfaces/IStakeManager.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract LightWalletFactoryIntegrationTest is BaseIntegrationTest {
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
    function test_simulateValidation_revertWithValidationResult() public {
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
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint);
        UserOperation memory op = ops[0];

        IEntryPoint.ReturnInfo memory returnInfo =
            IEntryPoint.ReturnInfo(405989, 1002500000000, false, 0, 281474976710655, "");
        IStakeManager.StakeInfo memory senderInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory factoryInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory paymasterInfo = IStakeManager.StakeInfo(0, 0);

        vm.expectRevert(
            abi.encodeWithSelector(
                IEntryPoint.ValidationResult.selector, returnInfo, senderInfo, factoryInfo, paymasterInfo
            )
        );
        entryPoint.simulateValidation(op);
    }

    /// Tests that the entrypoint returns a correct revert code if incorrect params
    function test_revertWhenIncorrectSignature_simulateValidation() public {
        // Construct the expected nonce
        bytes32 nonce = bytes32(uint256(123));

        // The to-be-deployed account at expected Hash, nonce
        LightWallet newWallet = LightWallet(payable(factory.getAddress(expectedImageHash, nonce)));

        // Set the initCode to create an account with the expected image hash and nonce
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, nonce)
        );

        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint);
        UserOperation memory op = ops[0];
        op.signature = "";

        // Revert for conventional upgrades w invalid signature
        vm.expectRevert(abi.encodeWithSignature("FailedOp(uint256,string)", uint256(0), "AA23 reverted (or OOG)"));
        entryPoint.simulateValidation(op);
    }
}
