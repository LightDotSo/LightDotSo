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

import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {UserOperation} from "@/contracts/LightWallet.sol";
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Unit tests for `LightVerifyingPaymaster` for getting base hash
contract PaymasterGetHash is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account complies w/ ERC-165
    function test_getHash() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c";
        bytes memory callData =
            hex"b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000";
        uint256 callGasLimit = 4514240;
        uint256 verificationGasLimit = 1854272;
        uint256 preVerificationGas = 1854272;
        uint256 maxFeePerGas = 56674171701;
        uint256 maxPriorityFeePerGas = 48087546673;
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        UserOperation memory userOperation = UserOperation(
            sender,
            nonce,
            initCode,
            callData,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            signature
        );

        LightVerifyingPaymaster paymaster = new LightVerifyingPaymaster(IEntryPoint(address(0)), address(1));

        // Log the paymaster address
        // solhint-disable-next-line no-console
        console.log(address(paymaster));

        bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function test_getHash_initCode() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        bytes memory callData = hex"";
        uint256 callGasLimit = 4514240;
        uint256 verificationGasLimit = 1854272;
        uint256 preVerificationGas = 1854272;
        uint256 maxFeePerGas = 56674171701;
        uint256 maxPriorityFeePerGas = 48087546673;
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        UserOperation memory userOperation = UserOperation(
            sender,
            nonce,
            initCode,
            callData,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            signature
        );

        LightVerifyingPaymaster paymaster = new LightVerifyingPaymaster(IEntryPoint(address(0)), address(1));

        // Log the paymaster address
        // solhint-disable-next-line no-console
        console.log(address(paymaster));

        bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function test_getHash_callData() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode = hex"";
        bytes memory callData =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        uint256 callGasLimit = 4514240;
        uint256 verificationGasLimit = 1854272;
        uint256 preVerificationGas = 1854272;
        uint256 maxFeePerGas = 56674171701;
        uint256 maxPriorityFeePerGas = 48087546673;
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        UserOperation memory userOperation = UserOperation(
            sender,
            nonce,
            initCode,
            callData,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            signature
        );

        LightVerifyingPaymaster paymaster = new LightVerifyingPaymaster(IEntryPoint(address(0)), address(1));

        // Log the paymaster address
        // solhint-disable-next-line no-console
        console.log(address(paymaster));

        bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function test_getHash_raw() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode = hex"";
        bytes memory callData = hex"";
        uint256 callGasLimit = 4514240;
        uint256 verificationGasLimit = 1854272;
        uint256 preVerificationGas = 1854272;
        uint256 maxFeePerGas = 56674171701;
        uint256 maxPriorityFeePerGas = 48087546673;
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        UserOperation memory userOperation = UserOperation(
            sender,
            nonce,
            initCode,
            callData,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            signature
        );

        LightVerifyingPaymaster paymaster = new LightVerifyingPaymaster(IEntryPoint(address(0)), address(1));

        // Log the paymaster address
        // solhint-disable-next-line no-console
        console.log(address(paymaster));

        bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function test_getHash_long() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        bytes memory callData =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        uint256 callGasLimit = 4514240;
        uint256 verificationGasLimit = 1854272;
        uint256 preVerificationGas = 1854272;
        uint256 maxFeePerGas = 56674171701;
        uint256 maxPriorityFeePerGas = 48087546673;
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        UserOperation memory userOperation = UserOperation(
            sender,
            nonce,
            initCode,
            callData,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            signature
        );

        LightVerifyingPaymaster paymaster = new LightVerifyingPaymaster(IEntryPoint(address(0)), address(1));

        // Log the paymaster address
        // solhint-disable-next-line no-console
        console.log(address(paymaster));

        bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // Log the byte code hash
        // solhint-disable-next-line no-console
        console.logBytes32(hash);
    }
}
