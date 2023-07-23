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

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {MockERC1155} from "solmate/test/utils/mocks/MockERC1155.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Integration tests for `LightWallet` sending ERC1155
contract BatchSendERC1155IntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // ERC1155 nft to send
    MockERC1155 internal multi;
    // Internal operational callData to send
    bytes internal callData;

    // Internal array of addresses to send ETH to
    address[] internal callAddresses;
    // Internal array of values to send ETH to
    uint256[] internal callValues;
    // Internal array of callDatas to send ETH to
    bytes[] internal callDatas;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();

        // Deploy a new MockERC1155
        multi = new MockERC1155();

        // Mint 10 tokens of id of 1 to the account
        multi.mint(address(account), 1, 10, "");
        assertEq(multi.balanceOf(address(account), 1), 10);

        // Set the callData to transfer nfts to the address one, two, and three
        callAddresses = new address[](3);
        callAddresses[0] = address(multi);
        callAddresses[1] = address(multi);
        callAddresses[2] = address(multi);

        callValues = new uint256[](0);

        callDatas = new bytes[](3);
        callDatas[0] =
            abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(1), 1, 1, "");
        callDatas[1] =
            abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(2), 1, 1, "");
        callDatas[2] =
            abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(3), 1, 1, "");

        // Set the operational callData
        callData = abi.encodeWithSelector(LightWallet.executeBatch.selector, callAddresses, callValues, callDatas);
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account revert when sending ERC1155 from a non-entrypoint
    function test_revertWhenNotEntrypoint_batchTransferERC1155() public {
        vm.expectRevert(bytes("account: not from EntryPoint"));
        address(account).call(callData);
    }

    /// Tests that the account can correctly transfer ERC1155
    function test_revertWhenInvalidSignature_batchTransferERC1155() public {
        // Example UserOperation to send 0 ERC1155 to the address one
        UserOperation[] memory ops = entryPoint.signPackUserOp(lightWalletUtils, address(account), callData, userKey);
        ops[0].signature = bytes("invalid");
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the account can correctly transfer ERC1155
    function test_batchTransferERC1155() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation[] memory ops = entryPoint.signPackUserOp(lightWalletUtils, address(account), callData, userKey);
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the corresponding destinations are correct
        assertEq(multi.balanceOf(address(1), 1), 1);
        assertEq(multi.balanceOf(address(1), 1), 1);
        assertEq(multi.balanceOf(address(1), 1), 1);
    }
}
