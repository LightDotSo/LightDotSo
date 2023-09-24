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
import {BaseForkTest} from "@/test/base/BaseForkTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `LightWallet` upgradeability
contract SimulateValidationForkTest is BaseForkTest {
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
    function testFork_simulateValidation() public {
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
        UserOperation memory op =
            entryPoint.signPackUserOp(vm, address(newWallet), "", userKey, initCode, weight, threshold, checkpoint);

        IEntryPoint.ReturnInfo memory returnInfo =
            IEntryPoint.ReturnInfo(396483, 1002500000000, false, 0, 281474976710655, "");
        IStakeManager.StakeInfo memory senderInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory factoryInfo = IStakeManager.StakeInfo(0, 0);
        IStakeManager.StakeInfo memory paymasterInfo = IStakeManager.StakeInfo(0, 0);

        // Simulate the validation
        vm.expectRevert(
            abi.encodeWithSelector(
                IEntryPoint.ValidationResult.selector, returnInfo, senderInfo, factoryInfo, paymasterInfo
            )
        );
        entryPoint.simulateValidation(op);
    }
}
