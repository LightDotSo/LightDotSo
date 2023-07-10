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
import {SimpleAccount, UserOperation} from "@/contracts/samples/SimpleAccount.sol";
import {SimpleAccountFactory} from "@/contracts/samples/SimpleAccountFactory.sol";
import {UniversalSigValidator} from "@/contracts/utils/UniversalSigValidator.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {Test} from "forge-std/Test.sol";

// From: https://github.com/zerodevapp/kernel/blob/daae3e246f628645a0c52db48710f025ca723189/test/foundry/Kernel.test.sol#L16

using ERC4337Utils for EntryPoint;

/// @notice Unit tests for `SimpleAccount`, organized by functions.
contract SimpleAccountTest is Test {
    // Initialzed Event from `Initializable.sol` https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e50c24f5839db17f46991478384bfda14acfb830/contracts/proxy/utils/Initializable.sol#L73
    event Initialized(uint8 version);

    // ERC6492 Detection Suffix
    bytes32 private constant ERC6492_DETECTION_SUFFIX =
        0x6492649264926492649264926492649264926492649264926492649264926492;

    // EntryPoint from eth-inifinitism
    EntryPoint private entryPoint;
    // SimpleAccount core contract
    SimpleAccount private account;
    // SimpleAccountFactory core contract
    SimpleAccountFactory private factory;
    // UniversalSigValidator
    UniversalSigValidator private validator;

    // Address of the owner of the account
    address private user;
    // Private key of the owner of the account
    uint256 private userKey;
    // Address of the beneficiary of the account
    address payable private beneficiary;

    function setUp() public {
        // Deploy the EntryPoint
        entryPoint = new EntryPoint();
        // Deploy the SimpleAccountFactory w/ EntryPoint
        factory = new SimpleAccountFactory(entryPoint);
        // Deploy the UniversalSigValidator
        validator = new UniversalSigValidator();
        // Set the user and userKey
        (user, userKey) = makeAddrAndKey("user");
        // Create the account using the factory w/ nonce 0
        account = factory.createAccount(user, 0);
        // Set the beneficiary
        beneficiary = payable(address(makeAddr("beneficiary")));

        // Deposit 1e30 ETH into the account
        vm.deal(address(account), 1e30);
    }

    // Tests that the account is initialized properly
    function test_simple_initialize() public {
        vm.expectEmit(true, true, true, true);
        emit Initialized(255);
        // Create a new account for the implementation
        account = new SimpleAccount(entryPoint);
    }

    // Tests that the account can not be initialized twice
    function test_simple_implementation_noInitialize() public {
        // Create a new account for the implementation
        account = new SimpleAccount(entryPoint);
        // Ensure that the account is not initializable on the implementation contract
        vm.expectRevert(bytes("Initializable: contract is already initialized"));
        account.initialize(address(this));
    }

    // Tests that the account can correctly transfer ETH
    function test_simple_transfer_eth() public {
        // Example UserOperation to send 0 ETH to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account), abi.encodeWithSelector(SimpleAccount.execute.selector, address(1), 1, bytes(""))
        );
        op.signature = abi.encodePacked(entryPoint.signUserOpHash(vm, userKey, op));
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        entryPoint.handleOps(ops, beneficiary);
        // Assert that the balance of the account is 1
        assertEq(address(1).balance, 1);
        // Assert the balance of the account is the Deposit - Gas
        assertEq(address(entryPoint).balance, 1_002_500_000_000 - 159_348);
    }

    // Tests that the account can correctly transfer ERC20
    function test_simple_transfer_erc20() public {
        // Deploy a new MockERC20
        MockERC20 token = new MockERC20("Test", "TEST", 18);

        // Mint 1e18 tokens to the account
        token.mint(address(account), 1e18);
        assertEq(token.balanceOf(address(account)), 1e18);

        // Example UserOperation to send 1 ERC20 to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                SimpleAccount.execute.selector,
                address(token),
                0,
                abi.encodeWithSelector(IERC20.transfer.selector, address(1), 1)
            )
        );
        op.signature = abi.encodePacked(entryPoint.signUserOpHash(vm, userKey, op));
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the destination is 1
        assertEq(token.balanceOf(address(1)), 1);
        // Assert that the balance of the account decreased by 1
        assertEq(token.balanceOf(address(account)), 1e18 - 1);
    }

    // Tests that the account can correctly transfer ERC721
    function test_simple_transfer_erc721() public {
        // Deploy a new MockERC721
        MockERC721 nft = new MockERC721("Test", "TEST");

        // Mint 1e18 tokens to the account
        nft.mint(address(account), 1);
        assertEq(nft.balanceOf(address(account)), 1);

        // Example UserOperation to send 1 ERC721 to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                SimpleAccount.execute.selector,
                address(nft),
                0,
                abi.encodeWithSelector(IERC721.transferFrom.selector, address(account), address(1), 1)
            )
        );
        op.signature = abi.encodePacked(entryPoint.signUserOpHash(vm, userKey, op));
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the destination is 1
        assertEq(nft.balanceOf(address(1)), 1);
        // Assert that the balance of the account is 0
        assertEq(nft.balanceOf(address(account)), 0);
    }

    // Tests that the account can correctly transfer ERC1155
    function test_simple_transfer_erc1155() public {
        // Deploy a new MockERC1155
        MockERC1155 multi = new MockERC1155();

        // Mint 10 tokens of id:1 to the account
        multi.mint(address(account), 1, 10, "");
        assertEq(multi.balanceOf(address(account), 1), 10);

        // Example UserOperation to send 1 ERC1155 of id:1 to the address one
        UserOperation memory op = entryPoint.fillUserOp(
            address(account),
            abi.encodeWithSelector(
                SimpleAccount.execute.selector,
                address(multi),
                0,
                abi.encodeWithSelector(IERC1155.safeTransferFrom.selector, address(account), address(1), 1, 1, "")
            )
        );
        op.signature = abi.encodePacked(entryPoint.signUserOpHash(vm, userKey, op));
        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        entryPoint.handleOps(ops, beneficiary);

        // Assert that the balance of the destination is 1
        assertEq(multi.balanceOf(address(1), 1), 1);
        // Assert that the balance of the account decreased by 1
        assertEq(multi.balanceOf(address(account), 1), 9);
    }
}
