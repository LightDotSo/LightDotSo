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
import {LightWalletUtils} from "@/contracts/utils/LightWalletUtils.sol";
import {BaseTest} from "@/test/base/BaseTest.sol";
import {BaseFactoryTest} from "@/test/base/BaseFactoryTest.sol";
import {ProxyUtils} from "@/test/utils/ProxyUtils.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

contract LightWalletFactoryTest is BaseTest, BaseFactoryTest {
    function setUp() public virtual override {
        // Setup the base tests
        BaseTest.setUp();
        // Setup the base factory tests
        _setUpBaseFactory();
    }

    /// Tests that the factory can create a new account at the predicted address
    function test_light_predictedCreateAccount() public {
        // Get the predicted address of the new account
        address predicted = factory.getAddress(bytes32(uint256(1)), 0);
        // Assert that the predicted address matches the created account
        assertEq(predicted, address(account));
        // Get the immutable implementation in the factory
        LightWallet implementation = factory.accountImplementation();
        // Assert that the implementation of the created account is the LightWallet
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(implementation));
    }

    /// Tests that the factory revert when creating an account with a nonce that is 0
    function test_light_revertBytesZeroCreateAccount() public {
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("ImageHashIsZero()"));
        // Get the predicted address of the new account
        account = factory.createAccount(bytes32(0), 0);
    }

    /// Tests that the factory reverts when trying to upgrade from outside address
    function test_light_revertDisabledUpgradeToUUPS() public {
        // Deploy new version of LightWallet
        LightWallet accountV2 = new LightWallet(entryPoint);
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("OnlySelfAuth(address,address)", address(this), address(account)));
        // Check that the account is the new implementation
        _upgradeTo(address(account), address(accountV2));
    }

    /// Tests that the factory reverts when trying to upgrade to an immutable address
    function test_light_revertDisabledUpgradeToImmutable() public {
        // Deploy the Immutable
        _deployImmutable();
        // Revert for conventional upgrades w/o signature
        vm.expectRevert(abi.encodeWithSignature("OnlySelfAuth(address,address)", address(this), address(account)));
        // Check that upgrade to immutable works
        _upgradeTo(address(account), address(immutableProxy));
    }

    /// Tests that there is no proxy admin for the account
    function test_light_noProxyAdmin() public {
        // Check that no proxy admin exists
        _noProxyAdmin(address(account));
    }

    /// Tests that the account is not initializable twice
    function test_light_noInitializeTwice() public {
        // Check that the account is not initializable twice
        _noInitializeTwice(address(account), abi.encodeWithSignature("initialize(bytes32)", bytes32(uint256(0))));
    }

    /// Tests that the account can upgrade to a immutable proxy
    function test_light_upgradeToImmutable() public {
        // Get the expected image hash
        bytes32 expectedImageHash = lightWalletUtils.getExpectedImageHash(user);

        // Create the account using the factory w/ nonce 0 and hash
        account = factory.createAccount(expectedImageHash, 0);

        // Deposit 1e30 ETH into the account
        vm.deal(address(account), 1e30);

        // Deploy the immutable proxy
        _deployImmutable();

        // Example UserOperation to update the account to immutable address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("upgradeTo(address)", address(immutableProxy))
            )
        );

        // Get the hash of the UserOperation
        bytes32 hash = entryPoint.getUserOpHash(op);

        // Sign the hash
        bytes memory sig = lightWalletUtils.signDigest(hash, address(account), userKey);

        // Pack the signature
        bytes memory signature = lightWalletUtils.packLegacySignature(sig);
        op.signature = signature;

        // Pack the UserOperation
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the account is now immutable
        assertEq(proxyUtils.getProxyImplementation(address(account)), address(immutableProxy));
    }
}
