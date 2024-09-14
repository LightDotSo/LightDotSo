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

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
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
        nonce = bytes32(uint256(3));

        // The to-be-deployed account at expected Hash, nonce
        wallet = LightWallet(payable(factory.getAddress(expectedImageHash, nonce)));

        // Deposit 1e30 ETH into the account
        vm.deal(address(wallet), 1e30);

        _testCreateAccountFromEntryPoint();
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the factory revert when creating an account with a hash that is 0
    function test_revertWhenHashZero_createAccountFromEntryPoint() public {
        // Set the initCode to create an account with the expected image hash and nonce
        bytes memory initCode = abi.encodePacked(
            address(factory), abi.encodeWithSelector(LightWalletFactory.createAccount.selector, 0, nonce)
        );

        // Example UserOperation to create the account
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(1), "", userKey, initCode, weight, threshold, checkpoint);

        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("FailedOp(uint256,string)", uint256(0), "AA13 initCode failed or OOG"));
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the factory revert when creating an account that already exists
    function test_revertWhenAlreadyExists_createAccountFromEntryPoint() public {
        // Example UserOperation to create the account w/ the same params
        PackedUserOperation[] memory ops = _testSignPackUserOpWithInitCode();

        vm.expectRevert(
            abi.encodeWithSignature("FailedOp(uint256,string)", uint256(0), "AA10 sender already constructed")
        );
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the factory can create a new account at the predicted address
    function test_createAccountFromEntryPoint_emitEvents() public {
        // Construct the new nonce
        nonce = bytes32(uint256(300_000));

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

        // vm.expectEmit(true, false, false, false);
        // emit ImageHashUpdated(expectedImageHash);
        // vm.expectEmit(true, true, false, false);
        // emit LightWalletInitialized(address(entryPoint), expectedImageHash);
        // vm.expectEmit(true, false, false, false);
        // vm.expectEmit(true, true, true, true);
        // emit Initialized(1);
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
