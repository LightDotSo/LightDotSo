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

import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {BaseTest} from "@/test/base/BaseTest.t.sol";
import {PackedUserOperation} from "@/contracts/LightWallet.sol";
import {LightPaymaster} from "@/contracts/LightPaymaster.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";

/// @notice Unit tmpDisable_tests for `LightPaymaster` for getting base hash
contract PaymasterGetHashUnitTest is BaseTest {
    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /// Tests that the account complies w/ ERC-165
    function tmpDisable_test_getHash() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c";
        bytes memory callData =
            hex"b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 1854272;
        bytes32 gasFees = bytes32(0);
        uint256 maxPriorityFeePerGas = 48087546673;
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        PackedUserOperation memory userOperation = PackedUserOperation(
            sender,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            signature
        );

        // LightPaymaster paymaster = new LightPaymaster(IEntryPoint(address(0)), address(1));

        // // Log the paymaster address
        // // solhint-disable-next-line no-console
        // console.log(address(paymaster));

        // bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // // Log the byte code hash
        // // solhint-disable-next-line no-console
        // console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function tmpDisable_test_getHash_initCode() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        bytes memory callData = hex"";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 1854272;
        bytes32 gasFees = bytes32(0);
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        PackedUserOperation memory userOperation = PackedUserOperation(
            sender,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            signature
        );

        // LightPaymaster paymaster = new LightPaymaster(IEntryPoint(address(0)), address(1));

        // // Log the paymaster address
        // // solhint-disable-next-line no-console
        // console.log(address(paymaster));

        // bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // // Log the byte code hash
        // // solhint-disable-next-line no-console
        // console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function tmpDisable_test_getHash_callData() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode = hex"";
        bytes memory callData =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 1854272;
        bytes32 gasFees = bytes32(0);
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        PackedUserOperation memory userOperation = PackedUserOperation(
            sender,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            signature
        );

        // LightPaymaster paymaster = new LightPaymaster(IEntryPoint(address(0)), address(1));

        // // Log the paymaster address
        // // solhint-disable-next-line no-console
        // console.log(address(paymaster));

        // bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // // Log the byte code hash
        // // solhint-disable-next-line no-console
        // console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function tmpDisable_test_getHash_raw() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode = hex"";
        bytes memory callData = hex"";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 1854272;
        bytes32 gasFees = bytes32(0);
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        PackedUserOperation memory userOperation = PackedUserOperation(
            sender,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            signature
        );

        // LightPaymaster paymaster = new LightPaymaster(IEntryPoint(address(0)), address(1));

        // // Log the paymaster address
        // // solhint-disable-next-line no-console
        // console.log(address(paymaster));

        // bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // // Log the byte code hash
        // // solhint-disable-next-line no-console
        // console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function tmpDisable_test_getHash_long() public {
        address sender = address(0xF46D20dC61A5f43773Ad172602647f194a69a16d);
        uint256 nonce = 0;
        bytes memory initCode =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a07580000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        bytes memory callData =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018b838a0758";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 1854272;
        bytes32 gasFees = bytes32(0);
        bytes memory paymasterAndData =
            hex"0dcd1bf9a1b36ce34237eeafef220932846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c";
        bytes memory signature = hex"";

        PackedUserOperation memory userOperation = PackedUserOperation(
            sender,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            signature
        );

        // LightPaymaster paymaster = new LightPaymaster(IEntryPoint(address(0)), address(1));

        // // Log the paymaster address
        // // solhint-disable-next-line no-console
        // console.log(address(paymaster));

        // bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // // Log the byte code hash
        // // solhint-disable-next-line no-console
        // console.logBytes32(hash);
    }

    /// Tests that the account complies w/ ERC-165
    function tmpDisable_test_getHash_real() public {
        address sender = address(0x407d125a586AeAF0a39FCf81707f3Fd918beD97E);
        uint256 nonce = 0;
        bytes memory initCode =
            hex"0000000000756d3e6464f5efe7e413a0af1c7474183815c83c01efabf2ce62868626005b468fcc0cd03c644030e51dad0d5df74b0fbd4e950000000000000000000000000000000000000000000000000000018c0da7ef6c";
        bytes memory callData =
            hex"b61d27f60000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000";
        bytes32 accountGasLimits = bytes32(0);
        uint256 preVerificationGas = 1854272;
        bytes32 gasFees = bytes32(0);
        bytes memory paymasterAndData =
            hex"000000000003193facb32d1c120719892b7ae977000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000656404942d2c28daf31d1af4f9e904462433f176645eef73bcdfe2175927a145df4105ad2e47c7cae153359b4759ef95de25f06adb2ff5bb58f2accd70cc015993ab777a1c";
        bytes memory signature = hex"";

        PackedUserOperation memory userOperation = PackedUserOperation(
            sender,
            nonce,
            initCode,
            callData,
            accountGasLimits,
            preVerificationGas,
            gasFees,
            paymasterAndData,
            signature
        );

        // LightPaymaster paymaster = new LightPaymaster(IEntryPoint(address(0)), address(1));

        // // Log the paymaster address
        // // solhint-disable-next-line no-console
        // console.log(address(paymaster));

        // bytes32 hash = paymaster.getHash(userOperation, uint48(0), uint48(0));

        // // Log the byte code hash
        // // solhint-disable-next-line no-console
        // console.logBytes32(hash);
    }
}
