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

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
import {MockERC721} from "solmate/test/utils/mocks/MockERC721.sol";
import {MockERC1155} from "solmate/test/utils/mocks/MockERC1155.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;
// From: https://github.com/zerodevapp/kernel/blob/daae3e246f628645a0c52db48710f025ca723189/test/foundry/Kernel.test.sol#L16

/// @notice Unit tests for `LightWallet`, organized by functions.
contract LightWalletTest is BaseIntegrationTest {
    function setUp() public virtual override {
        BaseIntegrationTest.setUp();
    }

    /// Tests that the account is initialized properly
    function test_initialize() public {
        vm.expectEmit(true, true, true, true);
        emit Initialized(255);
        // Create a new account for the implementation
        account = new LightWallet(entryPoint);
    }

    /// Tests the account slot implementation
    function test_image_hash() public {
        // Create a new account for the implementation
        account = new LightWallet(entryPoint);

        // Assert that the image hash is correct
        assertEq(
            // keccak256("org.arcadeum.module.auth.upgradable.image.hash");
            storageUtils.readBytes32(bytes32(0xea7157fa25e3aa17d0ae2d5280fa4e24d421c61842aa85e45194e1145aa72bf8)),
            bytes32(uint256(0))
        );
    }

    /// Tests that the account can not be initialized twice
    function test_implementation_noInitialize() public {
        // Create a new account for the implementation
        account = new LightWallet(entryPoint);
        // Ensure that the account is not initializable on the implementation contract
        vm.expectRevert(bytes("Initializable: contract is already initialized"));
        account.initialize(bytes32(uint256(1)));
    }

    /// Tests that the account can correctly transfer ETH
    function test_transfer_eth() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account), abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes(""))
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

        // Assert that the balance of the account is 1
        assertEq(address(1).balance, 1);
    }

    /// Tests that the account can correctly transfer ERC20
    function test_transfer_erc20() public {
        // Deploy a new MockERC20
        MockERC20 token = new MockERC20("Test", "TEST", 18);

        // Mint 1e18 tokens to the account
        token.mint(address(account), 1e18);
        assertEq(token.balanceOf(address(account)), 1e18);

        // Example UserOperation to send 1 ERC20 to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(token),
                0,
                abi.encodeWithSelector(IERC20.transfer.selector, address(1), 1)
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

        // Assert that the balance of the destination is 1
        assertEq(token.balanceOf(address(1)), 1);
        // Assert that the balance of the account decreased by 1
        assertEq(token.balanceOf(address(account)), 1e18 - 1);
    }

    /// Tests that the account can correctly transfer ERC721
    function test_transfer_erc721() public {
        // Deploy a new MockERC721
        MockERC721 nft = new MockERC721("Test", "TEST");

        // Mint 1e18 tokens to the account
        nft.mint(address(account), 1);
        assertEq(nft.balanceOf(address(account)), 1);

        // Example UserOperation to send 1 ERC721 to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(nft),
                0,
                abi.encodeWithSelector(IERC721.transferFrom.selector, address(account), address(1), 1)
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

        // Assert that the balance of the destination is 1
        assertEq(nft.balanceOf(address(1)), 1);
        // Assert that the balance of the account is 0
        assertEq(nft.balanceOf(address(account)), 0);
    }

    /// Tests that the account can correctly transfer ERC1155
    function test_transfer_erc1155() public {
        // Deploy a new MockERC1155
        MockERC1155 multi = new MockERC1155();

        // Mint 10 tokens of id:1 to the account
        multi.mint(address(account), 1, 10, "");
        assertEq(multi.balanceOf(address(account), 1), 10);

        // Example UserOperation to send 1 ERC1155 of id:1 to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(multi),
                0,
                abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(1), 1, 1, "")
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

        // Assert that the balance of the destination is 1
        assertEq(multi.balanceOf(address(1), 1), 1);
        // Assert that the balance of the account decreased by 1
        assertEq(multi.balanceOf(address(account), 1), 9);
    }

    /// Tests that the account can correctly update its image hash
    function test_updateImageHash() public {
        // Expect that the image hash is the expected one
        assertEq(account.imageHash(), expectedImageHash);

        // Example UserOperation to update the account to immutable address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                LightWallet.execute.selector,
                address(account),
                0,
                abi.encodeWithSignature("updateImageHash(bytes32)", bytes32(uint256(1)))
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

        // Expect that the image hash is the updated one
        assertEq(account.imageHash(), bytes32(uint256(1)));
    }
}
