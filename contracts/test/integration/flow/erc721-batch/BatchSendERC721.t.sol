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

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {MockERC721} from "solmate/test/utils/mocks/MockERC721.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, PackedUserOperation} from "@/contracts/LightWallet.sol";
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
    function test_RevertWhen_TheSenderIsNotEntrypoint() public {
        // it should revert
        vm.expectRevert(bytes("account: not from EntryPoint"));
        (bool success,) = address(account).call(callData);
        assertEq(success, true);
    }

    modifier whenTheSenderIsEntrypoint() {
        _;
    }

    /// Tests that the account can correctly transfer ERC721
    function test_RevertWhen_TheSignatureIsInvalid() external whenTheSenderIsEntrypoint {
        // Example UserOperation to send 0 ERC721 to the address one
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        ops[0].signature = bytes("invalid");

        // it should revert
        // it should revert on a {InvalidSignature} error
        vm.expectRevert();
        entryPoint.handleOps(ops, beneficiary);
    }

    /// Tests that the account can correctly transfer ERC721
    function test_WhenTheSignatureIsValid() external whenTheSenderIsEntrypoint {
        // Example UserOperation to send 0 ETH to the address one
        PackedUserOperation[] memory ops =
            entryPoint.signPackUserOps(vm, address(account), callData, userKey, "", weight, threshold, checkpoint);
        entryPoint.handleOps(ops, beneficiary);

        // it should batch transfer the ERC721 to the recipient(s)
        assertEq(nft.balanceOf(address(1)), 1);
        assertEq(nft.balanceOf(address(2)), 1);
        assertEq(nft.balanceOf(address(3)), 1);
    }
}
