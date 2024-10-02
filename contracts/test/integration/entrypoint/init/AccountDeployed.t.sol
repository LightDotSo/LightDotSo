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
contract EntrypointInitAccountDeployedIntegrationTest is BaseIntegrationTest {
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
    function test_RevertWhen_IfTheHashIsZero() public {
        // Set the initCode to create an account with the expected image hash and nonce
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeWithSelector(LightWalletFactory.createAccount.selector, 0, nonce)
        );

        // Example UserOperation to create the account
        PackedUserOperation[] memory ops = entryPoint.signPackUserOps(
            vm, address(1), "", userKey, initCode, weight, threshold, checkpoint
        );

        // Revert for conventional upgrades w/o signature
        vm.expectRevert(
            abi.encodeWithSignature(
                "FailedOp(uint256,string)", uint256(0), "AA13 initCode failed or OOG"
            )
        );
        // it should revert
        // it should revert on a {AA13 initCode failed or OOG} error
        entryPoint.handleOps(ops, beneficiary);
    }

    modifier whenIfTheHashIsNotZero() {
        _;
    }

    /// Tests that the factory revert when creating an account that already exists
    function test_WhenTheAddressAlreadyExists() external whenIfTheHashIsNotZero {
        // Example UserOperation to create the account w/ the same params
        PackedUserOperation[] memory ops = _testSignPackUserOpWithInitCode();

        vm.expectRevert(
            abi.encodeWithSignature(
                "FailedOp(uint256,string)", uint256(0), "AA10 sender already constructed"
            )
        );
        // it should revert on a {AA10 sender already constructed} error
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the factory can create a new account at the predicted address
    function test_WhenTheAddressDoesNotExist() external whenIfTheHashIsNotZero {
        // Construct the new nonce
        nonce = bytes32(uint256(300_000));

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

        // vm.expectEmit(true, false, false, false);
        // emit ImageHashUpdated(expectedImageHash);
        // vm.expectEmit(true, true, false, false);
        // emit LightWalletInitialized(address(entryPoint), expectedImageHash);
        // vm.expectEmit(true, false, false, false);
        // vm.expectEmit(true, true, true, true);
        // emit Initialized(18446744073709551615);

        // it should deploy a new LightWallet with the correct hash
        // it should deploy a new LightWallet
        entryPoint.handleOps(ops, beneficiary);

        // Get the predicted address of the new account
        address predicted = factory.getAddress(expectedImageHash, bytes32(uint256(3)));

        // Assert that the predicted address matches the created account
        // it should equal the {getAddress} function
        assertEq(predicted, address(wallet));
        // Get the immutable implementation in the factory
        LightWallet implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the LightWallet
        assertEq(getProxyImplementation(address(wallet)), address(implementation));

        // Check that no proxy admin exists
        // it should not have a proxy admin
        _noProxyAdmin(address(wallet));

        // Check that the wallet is not initializable twice
        // it should not be able to initialize twice
        _noInitializeTwice(
            address(wallet), abi.encodeWithSignature("initialize(bytes32)", bytes32(uint256(0)))
        );
    }
}
