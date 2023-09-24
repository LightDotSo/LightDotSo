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

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {MockERC721} from "solmate/test/utils/mocks/MockERC721.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Integration tests for `LightWallet` sending ERC721
contract BatchSendERC721IntegrationTest is BaseIntegrationTest {
    // -------------------------------------------------------------------------
    // Variables
    // -------------------------------------------------------------------------

    // ERC721 nft to send
    MockERC721 internal nft;
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

        // Deploy a new MockERC721
        nft = new MockERC721("Test", "TEST");

        // Mint 3 ERC721s to the account
        nft.mint(address(account), 1);
        nft.mint(address(account), 2);
        nft.mint(address(account), 3);
        assertEq(nft.balanceOf(address(account)), 3);

        // Set the callData to transfer nfts to the address one, two, and three
        callAddresses = new address[](3);
        callAddresses[0] = address(nft);
        callAddresses[1] = address(nft);
        callAddresses[2] = address(nft);

        callValues = new uint256[](0);

        callDatas = new bytes[](3);
        callDatas[0] = abi.encodeWithSelector(IERC721.transferFrom.selector, address(account), address(1), 1);
        callDatas[1] = abi.encodeWithSelector(IERC721.transferFrom.selector, address(account), address(2), 2);
        callDatas[2] = abi.encodeWithSelector(IERC721.transferFrom.selector, address(account), address(3), 3);

        // Set the operational callData
        callData = abi.encodeWithSelector(LightWallet.executeBatch.selector, callAddresses, callValues, callDatas);
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account revert when sending ERC721 from a non-entrypoint
    function test_revertWhenNotEntrypoint_batchTransferERC721() public {
        vm.expectRevert(bytes("account: not from EntryPoint"));
        (bool success,) = address(account).call(callData);
        assertEq(success, true);
    }

    /// Tests that the account can correctly transfer ERC721
    function test_revertWhenInvalidSignature_batchTransferERC721() public {
        // Example UserOperation to send 0 ERC721 to the address one
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        ops[0].signature = bytes("invalid");
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the account can correctly transfer ERC721
    function test_batchTransferERC721() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the corresponding destinations are correct
        assertEq(nft.balanceOf(address(1)), 1);
        assertEq(nft.balanceOf(address(2)), 1);
        assertEq(nft.balanceOf(address(3)), 1);
    }
}
