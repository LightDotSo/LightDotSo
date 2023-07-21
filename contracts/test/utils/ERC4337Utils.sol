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

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

// From: https://github.com/zerodevapp/kernel/blob/daae3e246f628645a0c52db48710f025ca723189/test/foundry/ERC4337Utils.sol
// Thank you to the awesome folks at ZeroDev for this utility library!
// License: MIT

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Vm} from "forge-std/Test.sol";
import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWalletUtils} from "@/contracts/utils/LightWalletUtils.sol";
import {UserOperation} from "@/contracts/LightWallet.sol";
import {ERC4337Utils} from "@/test/utils/ERC4337Utils.sol";

using ERC4337Utils for EntryPoint;

/// @notice Utility functions for ERC4337
library ERC4337Utils {
    /// @dev Fills a UserOperation with default values
    /// @param _entryPoint The entry point contract
    /// @param _account The account to fill the UserOperation with
    /// @param _data The data to fill the UserOperation with
    function fillUserOp(EntryPoint _entryPoint, address _account, bytes memory _data)
        internal
        view
        returns (UserOperation memory op)
    {
        op.sender = _account;
        op.nonce = _entryPoint.getNonce(_account, 0);
        op.callData = _data;
        op.callGasLimit = 10000000;
        op.verificationGasLimit = 10000000;
        op.preVerificationGas = 50000;
        op.maxFeePerGas = 50000;
        op.maxPriorityFeePerGas = 1;
    }

    /// @dev Signs the hash of a UserOperation
    /// @param _entryPoint The entry point contract
    /// @param _vm The VM contract
    /// @param _key The user's private key to sign the UserOperation with
    /// @param _op The UserOperation to sign
    function signUserOpHash(EntryPoint _entryPoint, Vm _vm, uint256 _key, UserOperation memory _op)
        internal
        view
        returns (bytes memory signature)
    {
        bytes32 hash = _entryPoint.getUserOpHash(_op);
        (uint8 v, bytes32 r, bytes32 s) = _vm.sign(_key, ECDSA.toEthSignedMessageHash(hash));
        signature = abi.encodePacked(r, s, v);
    }

    /// @dev Signs a UserOperation with a user's key
    /// @param _entryPoint The entry point contract
    /// @param _lightWalletUtils The `LightWalletUtils` contract
    /// @param _account The account to sign the UserOperation with
    /// @param _data The data to fill the UserOperation with
    /// @param _key The user's private key to sign the UserOperation with
    function signPackUserOp(
        EntryPoint _entryPoint,
        LightWalletUtils _lightWalletUtils,
        address _account,
        bytes memory _data,
        uint256 _key
    ) internal view returns (UserOperation[] memory ops) {
        // Example UserOperation to update the account to immutable address one
        UserOperation memory op = _entryPoint.fillUserOp(address(_account), _data);

        // Get the hash of the UserOperation
        bytes32 userOphash = _entryPoint.getUserOpHash(op);

        // Sign the hash
        bytes memory sig = _lightWalletUtils.signDigest(userOphash, _account, _key);

        // Pack the signature
        bytes memory signature = _lightWalletUtils.packLegacySignature(sig);
        op.signature = signature;

        // Pack the UserOperation
        ops = new UserOperation[](1);
        ops[0] = op;
    }
}
