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

        // The to-be-deployed account at expected Hash, nonce 3
        wallet = LightWallet(payable(address(0x2B65f0696ba6c37FFC9A686361f9d46a3b7c0B9f)));

        // Deposit 1e30 ETH into the account
        vm.deal(address(wallet), 1e30);

        _testCreateAccountFromEntryPoint();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the factory can create a new account at the predicted address
    function test_simulateValidation() public {
        // The to-be-deployed account at expected Hash, nonce 300
        LightWallet newWallet = LightWallet(payable(address(0x9ADC9Fab68ECd94CD9DbE1bda19C9453580b4b6c)));

        // Deposit 1e30 ETH into the account
        vm.deal(address(newWallet), 1e30);

        // Set the initCode to create an account with the expected image hash and nonce 300
        bytes memory initCode = abi.encodePacked(
            address(factory), abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, 300)
        );
        // Example UserOperation to create the account
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint);
        UserOperation memory op = ops[0];

        IEntryPoint.ReturnInfo memory returnInfo =
            IEntryPoint.ReturnInfo(408489, 1002500000000, false, 0, 281474976710655, "");
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

    /// Utility function to create an account from the entry point
    function _testCreateAccountFromEntryPoint() internal {
        UserOperation[] memory ops = _testSignPackUserOpWithInitCode();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Utility function to run the signPackUserOp function
    function _testSignPackUserOpWithInitCode() internal view returns (UserOperation[] memory ops) {
        // Set the initCode to create an account with the expected image hash and nonce 3
        bytes memory initCode = abi.encodePacked(
            address(factory), abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, 3)
        );

        // Example UserOperation to create the account
        ops = entryPoint.signPackUserOps(vm, address(wallet), "", userKey, initCode, weight, threshold, checkpoint);
    }
}
