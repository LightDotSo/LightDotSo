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

// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
// import {MockERC721} from "solmate/test/utils/mocks/MockERC721.sol";
// import {MockERC1155} from "solmate/test/utils/mocks/MockERC1155.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet, UserOperation} from "@/contracts/LightWallet.sol";
import {BaseIntegrationTest} from "@/test/base/BaseIntegrationTest.t.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Integration tests for `LightWallet` sending ETH
contract SendEthIntegrationTest is BaseIntegrationTest {
    function setUp() public virtual override {
        // Setup the base factory tests
        BaseIntegrationTest.setUp();
    }

    /// Tests that the account can correctly transfer ETH
    function test_transferEth() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation[] memory ops = entryPoint.signPackUserOp(
            lightWalletUtils,
            address(account),
            abi.encodeWithSelector(LightWallet.execute.selector, address(1), 1, bytes("")),
            userKey
        );
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the account is 1
        assertEq(address(1).balance, 1);
    }

    // /// Tests that the account can correctly transfer ERC20
    // function test_transfer_erc20() public {
    //     // Deploy a new MockERC20
    //     MockERC20 token = new MockERC20("Test", "TEST", 18);

    //     // Mint 1e18 tokens to the account
    //     token.mint(address(account), 1e18);
    //     assertEq(token.balanceOf(address(account)), 1e18);

    //     // Example UserOperation to send 1 ERC20 to the address one
    //     UserOperation memory op = entryPoint.fillUserOp(
    //         address(account),
    //         abi.encodeWithSelector(
    //             LightWallet.execute.selector,
    //             address(token),
    //             0,
    //             abi.encodeWithSelector(IERC20.transfer.selector, address(1), 1)
    //         )
    //     );

    //     // Get the hash of the UserOperation
    //     bytes32 hash = entryPoint.getUserOpHash(op);

    //     // Sign the hash
    //     bytes memory sig = lightWalletUtils.signDigest(hash, address(account), userKey);

    //     // Pack the signature
    //     bytes memory signature = lightWalletUtils.packLegacySignature(sig);
    //     op.signature = signature;

    //     // Pack the UserOperation
    //     UserOperation[] memory ops = new UserOperation[](1);
    //     ops[0] = op;
    //     entryPoint.handleOps(ops, beneficiary);

    //     // Assert that the balance of the destination is 1
    //     assertEq(token.balanceOf(address(1)), 1);
    //     // Assert that the balance of the account decreased by 1
    //     assertEq(token.balanceOf(address(account)), 1e18 - 1);
    // }

    // /// Tests that the account can correctly transfer ERC721
    // function test_transfer_erc721() public {
    //     // Deploy a new MockERC721
    //     MockERC721 nft = new MockERC721("Test", "TEST");

    //     // Mint 1e18 tokens to the account
    //     nft.mint(address(account), 1);
    //     assertEq(nft.balanceOf(address(account)), 1);

    //     // Example UserOperation to send 1 ERC721 to the address one
    //     UserOperation memory op = entryPoint.fillUserOp(
    //         address(account),
    //         abi.encodeWithSelector(
    //             LightWallet.execute.selector,
    //             address(nft),
    //             0,
    //             abi.encodeWithSelector(IERC721.transferFrom.selector, address(account), address(1), 1)
    //         )
    //     );

    //     // Get the hash of the UserOperation
    //     bytes32 hash = entryPoint.getUserOpHash(op);

    //     // Sign the hash
    //     bytes memory sig = lightWalletUtils.signDigest(hash, address(account), userKey);

    //     // Pack the signature
    //     bytes memory signature = lightWalletUtils.packLegacySignature(sig);
    //     op.signature = signature;

    //     // Pack the UserOperation
    //     UserOperation[] memory ops = new UserOperation[](1);
    //     ops[0] = op;
    //     entryPoint.handleOps(ops, beneficiary);

    //     // Assert that the balance of the destination is 1
    //     assertEq(nft.balanceOf(address(1)), 1);
    //     // Assert that the balance of the account is 0
    //     assertEq(nft.balanceOf(address(account)), 0);
    // }

    // /// Tests that the account can correctly transfer ERC1155
    // function test_transfer_erc1155() public {
    //     // Deploy a new MockERC1155
    //     MockERC1155 multi = new MockERC1155();

    //     // Mint 10 tokens of id:1 to the account
    //     multi.mint(address(account), 1, 10, "");
    //     assertEq(multi.balanceOf(address(account), 1), 10);

    //     // Example UserOperation to send 1 ERC1155 of id:1 to the address one
    //     UserOperation memory op = entryPoint.fillUserOp(
    //         address(account),
    //         abi.encodeWithSelector(
    //             LightWallet.execute.selector,
    //             address(multi),
    //             0,
    //             abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(1), 1, 1, "")
    //         )
    //     );

    //     // Get the hash of the UserOperation
    //     bytes32 hash = entryPoint.getUserOpHash(op);

    //     // Sign the hash
    //     bytes memory sig = lightWalletUtils.signDigest(hash, address(account), userKey);

    //     // Pack the signature
    //     bytes memory signature = lightWalletUtils.packLegacySignature(sig);
    //     op.signature = signature;

    //     // Pack the UserOperation
    //     UserOperation[] memory ops = new UserOperation[](1);
    //     ops[0] = op;
    //     entryPoint.handleOps(ops, beneficiary);

    //     // Assert that the balance of the destination is 1
    //     assertEq(multi.balanceOf(address(1), 1), 1);
    //     // Assert that the balance of the account decreased by 1
    //     assertEq(multi.balanceOf(address(account), 1), 9);
    // }
}
