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
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the factory revert when creating an account with a nonce that is 0
    function test_createAccountFromEntryPoint() public {
        // The to-be-deployed account at hash 0, nonce 1
        LightWallet wallet = LightWallet(payable(address(0xE30950a24FA04488549227664D4a1f079c164f9D)));

        // Deposit 1e30 ETH into the account
        vm.deal(address(wallet), 1e30);

        // Example UserOperation to initialize an account
        UserOperation memory op = entryPoint.fillUserOp(address(wallet), "");
        op.initCode = abi.encodePacked(
            address(factory), abi.encodeWithSelector(LightWalletFactory.createAccount.selector, expectedImageHash, 3)
        );

        // Get the hash of the UserOperation
        bytes32 userOphash = entryPoint.getUserOpHash(op);

        // Sign the hash
        bytes memory sig = lightWalletUtils.signDigest(userOphash, address(wallet), userKey);

        // Pack the signature
        bytes memory signature = lightWalletUtils.packLegacySignature(sig);
        op.signature = signature;

        // Pack the UserOperation
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;

        entryPoint.handleOps(ops, beneficiary);
    }
}
