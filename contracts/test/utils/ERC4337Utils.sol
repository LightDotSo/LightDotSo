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

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

// From: https://github.com/zerodevapp/kernel/blob/daae3e246f628645a0c52db48710f025ca723189/test/foundry/ERC4337Utils.sol
// Thank you to the awesome folks at ZeroDev for this utility library!
// License: MIT

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {UserOperationLib} from "@eth-infinitism/account-abstraction/contracts/core/UserOperationLib.sol";
import {PackedUserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {Vm} from "forge-std/Test.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";
import {LightWalletUtils} from "@/test/utils/LightWalletUtils.sol";

using UserOperationLib for PackedUserOperation;
using ERC4337Utils for EntryPoint;

/// @notice Utility functions for ERC4337
library ERC4337Utils {
    // -------------------------------------------------------------------------
    // Utility Functions
    // -------------------------------------------------------------------------

    /// @dev Packs the account gas limits into a bytes32
    /// @param verificationGasLimit The verification gas limit
    /// @param callGasLimit The call gas limit
    /// @return The packed account gas limits
    function packAccountGasLimits(uint128 verificationGasLimit, uint128 callGasLimit) public pure returns (bytes32) {
        return bytes32((uint256(verificationGasLimit) << 128) | uint256(callGasLimit));
    }

    /// @dev Packs the gas fees into a bytes32
    /// @param maxPriorityFeePerGas The max priority fee per gas
    /// @param maxFeePerGas The max fee per gas
    /// @return The packed gas fees
    function packGasFees(uint128 maxPriorityFeePerGas, uint128 maxFeePerGas) public pure returns (bytes32) {
        return bytes32((uint256(maxPriorityFeePerGas) << 128) | uint256(maxFeePerGas));
    }

    /// @dev Packs the paymaster and data
    /// @param paymaster The paymaster address
    /// @param validationGasLimit The validation gas limit
    /// @param postOpGasLimit The post-operation gas limit
    /// @param paymasterData The paymaster data
    /// @return The packed paymaster and data
    function packPaymasterAndData(
        address paymaster,
        uint256 validationGasLimit,
        uint256 postOpGasLimit,
        bytes memory paymasterData
    ) public pure returns (bytes memory) {
        return abi.encodePacked(paymaster, uint128(validationGasLimit), uint128(postOpGasLimit), paymasterData);
    }

    // -------------------------------------------------------------------------
    // Internal Functions
    // -------------------------------------------------------------------------

    /// @dev Fills a UserOperation with default values
    /// @param _entryPoint The entry point contract
    /// @param _account The account to fill the UserOperation with
    /// @param _data The data to fill the UserOperation with
    function fillUserOp(EntryPoint _entryPoint, address _account, bytes memory _data)
        internal
        view
        returns (PackedUserOperation memory op)
    {
        op.sender = _account;
        op.nonce = _entryPoint.getNonce(_account, 0);
        op.callData = _data;
        op.accountGasLimits = packAccountGasLimits(10000000, 10000000);
        op.preVerificationGas = 50000;
        op.gasFees = packGasFees(1, 50000);
    }

    /// @dev Signs the hash of a UserOperation
    /// @param _entryPoint The entry point contract
    /// @param _vm The VM contract
    /// @param _key The user's private key to sign the UserOperation with
    /// @param _op The UserOperation to sign
    function signUserOp(EntryPoint _entryPoint, Vm _vm, uint256 _key, PackedUserOperation memory _op)
        internal
        view
        returns (bytes memory signature)
    {
        bytes32 hash = _entryPoint.getUserOpHash(_op);
        (uint8 v, bytes32 r, bytes32 s) = _vm.sign(_key, MessageHashUtils.toEthSignedMessageHash(hash));
        signature = abi.encodePacked(r, s, v);
    }

    /// @dev Signs a merkle root with a user's key
    /// @param _vm The VM contract
    /// @param _account The account to sign the UserOperation with
    /// @param _root The merkle root to sign
    /// @param _key The user's private key to sign the UserOperation with
    /// @param _weight The weight for the signature
    /// @param _threshold The threshold for the signature
    /// @param _checkpoint The checkpoint for the signature
    function signPackMerkleRoot(
        EntryPoint,
        Vm _vm,
        address _account,
        bytes32 _root,
        uint256 _key,
        uint8 _weight,
        uint16 _threshold,
        uint32 _checkpoint
    ) internal view returns (bytes memory op) {
        // Sign the hash
        bytes memory sig = LightWalletUtils.signDigest(_vm, _root, _account, _key, false);

        // Pack the signature
        bytes memory signature = LightWalletUtils.packLegacySignature(sig, _weight, _threshold, _checkpoint);

        return signature;
    }

    /// @dev Signs a UserOperation with a user's key
    /// @param _entryPoint The entry point contract
    /// @param _vm The VM contract
    /// @param _account The account to sign the UserOperation with
    /// @param _data The data to fill the UserOperation with
    /// @param _key The user's private key to sign the UserOperation with
    /// @param _initCode The initialization code for the user operation (optional parameter)
    /// @param _weight The weight for the signature
    /// @param _threshold The threshold for the signature
    /// @param _checkpoint The checkpoint for the signature
    function signPackUserOp(
        EntryPoint _entryPoint,
        Vm _vm,
        address _account,
        bytes memory _data,
        uint256 _key,
        bytes memory _initCode,
        uint8 _weight,
        uint16 _threshold,
        uint32 _checkpoint
    ) internal view returns (PackedUserOperation memory op) {
        // Example UserOperation to update the account to immutable address one
        op = _entryPoint.fillUserOp(address(_account), _data);

        // Set the initCode from the params
        if (_initCode.length > 0) {
            op.initCode = _initCode;
        }
        // Get the hash of the UserOperation
        bytes32 userOphash = _entryPoint.getUserOpHash(op);

        // Sign the hash
        bytes memory sig = LightWalletUtils.signDigest(_vm, userOphash, _account, _key, false);

        // Pack the signature
        bytes memory signature = LightWalletUtils.packLegacySignature(sig, _weight, _threshold, _checkpoint);
        op.signature = signature;
    }

    /// @dev Signs a UserOperation with a user's key
    /// @param _entryPoint The entry point contract
    /// @param _vm The VM contract
    /// @param _account The account to sign the UserOperation with
    /// @param _data The data to fill the UserOperation with
    /// @param _key The user's private key to sign the UserOperation with
    /// @param _initCode The initialization code for the user operation (optional parameter)
    /// @param _weight The weight for the signature
    /// @param _threshold The threshold for the signature
    /// @param _checkpoint The checkpoint for the signature
    function signPackUserOps(
        EntryPoint _entryPoint,
        Vm _vm,
        address _account,
        bytes memory _data,
        uint256 _key,
        bytes memory _initCode,
        uint8 _weight,
        uint16 _threshold,
        uint32 _checkpoint
    ) internal view returns (PackedUserOperation[] memory ops) {
        // Pack the UserOperation
        ops = new PackedUserOperation[](1);
        ops[0] = signPackUserOp(_entryPoint, _vm, _account, _data, _key, _initCode, _weight, _threshold, _checkpoint);
    }
}
