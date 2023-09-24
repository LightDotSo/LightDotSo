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

    /// Tests that the factory revert when creating an account with a hash that is 0
    function test_revertWhenHashZero_createAccountFromEntryPoint() public {
        // Set the initCode to create an account with the expected image hash and nonce 3
        bytes memory initCode =
            abi.encodePacked(address(factory), abi.encodeWithSelector(LightWalletFactory.createAccount.selector, 0, 3));

        // Example UserOperation to create the account
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(1), "", userKey, initCode, weight, threshold, checkpoint);

        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("FailedOp(uint256,string)", uint256(0), "AA13 initCode failed or OOG"));
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the factory revert when creating an account that already exists
    function test_revertWhenAlreadyExists_createAccountFromEntryPoint() public {
        // Example UserOperation to create the account w/ the same params
        UserOperation[] memory ops = _testSignPackUserOpWithInitCode();

        vm.expectRevert(
            abi.encodeWithSignature("FailedOp(uint256,string)", uint256(0), "AA10 sender already constructed")
        );
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the factory can create a new account at the predicted address
    function test_createAccountFromEntryPoint_emitEvents() public {
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

        vm.expectEmit(true, true, true, true);
        emit ImageHashUpdated(expectedImageHash);
        vm.expectEmit(true, true, true, true);
        emit Initialized(1);
        // vm.expectEmit(true, true, true, true);
        // emit LightWalletInitialized(address(entryPoint), hash);
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the factory can create a new wallet at the predicted address
    function test_createAccountFromEntryPoint_equalsGetAddress() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(expectedImageHash, bytes32(uint256(3)));

        // Assert that the predicted address matches the created account
        assertEq(predicted, address(wallet));
        // Get the immutable implementation in the factory
        LightWallet implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the LightWallet
        assertEq(getProxyImplementation(address(wallet)), address(implementation));
    }

    /// Tests that there is no proxy admin for the wallet
    function test_createAccountFromEntryPoint_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(wallet));
    }

    /// Tests that the wallet is not initializable twice
    function test_createAccountFromEntryPoint_noInitializeTwice() public {
        // Check that the wallet is not initializable twice
        _noInitializeTwice(address(wallet), abi.encodeWithSignature("initialize(bytes32)", bytes32(uint256(0))));
    }
}
